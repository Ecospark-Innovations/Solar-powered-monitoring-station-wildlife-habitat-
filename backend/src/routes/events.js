const express = require('express');
const router = express.Router();
const db = require('../db');
const { Op } = require('sequelize');

// POST /api/events - Log wildlife event
router.post('/', async (req, res) => {
  try {
    const { device_id, event_type, confidence, metadata } = req.body;

    if (!device_id || !event_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.Device.findOne({
      where: { deviceId: device_id }
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const event = await db.Event.create({
      deviceId: device.id,
      event_type,
      confidence: confidence || 0.8,
      metadata: metadata || {},
      device_timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Event logged',
      data: event
    });
  } catch (error) {
    console.error('Event POST error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events - Query events
router.get('/', async (req, res) => {
  try {
    const { deviceId, eventType, startDate, endDate, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (deviceId) where.deviceId = deviceId;
    if (eventType) where.event_type = eventType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const events = await db.Event.findAndCountAll({
      where,
      include: [{
        model: db.Device,
        as: 'device',
        attributes: ['name', 'deviceId', 'habitat_type']
      }],
      order: [['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 1000),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      total: events.count,
      data: events.rows
    });
  } catch (error) {
    console.error('Events GET error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/events/timeline/:deviceId - Get timeline of events for device
router.get('/timeline/:deviceId', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const device = await db.Device.findByPk(req.params.deviceId);
    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    const events = await db.Event.findAll({
      where: {
        deviceId: req.params.deviceId,
        createdAt: { [Op.gte]: startDate }
      },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      device: device.name,
      period_days: days,
      total_events: events.length,
      data: events
    });
  } catch (error) {
    console.error('Timeline GET error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
