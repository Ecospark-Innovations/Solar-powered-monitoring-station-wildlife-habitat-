const express = require('express');
const router = express.Router();
const db = require('../db');
const { Op } = require('sequelize');

// POST /api/events - Log event
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
      confidence: confidence || 0.5,
      metadata: metadata || {}
    });

    res.status(201).json({
      success: true,
      message: 'Event logged',
      data: event
    });
  } catch (error) {
    console.error('Event create error:', error);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

// GET /api/events - Query events
router.get('/', async (req, res) => {
  try {
    const { deviceId, eventType, startDate, endDate, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (eventType) where.event_type = eventType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    let deviceIdFilter = null;
    if (deviceId) {
      const device = await db.Device.findOne({
        where: { deviceId }
      });
      if (device) deviceIdFilter = device.id;
    }

    if (deviceIdFilter) where.deviceId = deviceIdFilter;

    const events = await db.Event.findAndCountAll({
      where,
      include: [{
        model: db.Device,
        attributes: ['name', 'habitat_type']
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
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

module.exports = router;
