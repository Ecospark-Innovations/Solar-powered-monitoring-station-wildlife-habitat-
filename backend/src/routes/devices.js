const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');
const { Op } = require('sequelize');

// POST /api/devices - Create new device
router.post('/', async (req, res) => {
  try {
    const { deviceId, name, description, habitat_type, latitude, longitude } = req.body;

    if (!deviceId || !name || !habitat_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.Device.create({
      deviceId,
      name,
      description,
      habitat_type,
      latitude,
      longitude,
      userId: req.user.id,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Device created',
      data: device
    });
  } catch (error) {
    console.error('Device create error:', error);
    res.status(500).json({ error: 'Failed to create device' });
  }
});

// GET /api/devices - List all devices
router.get('/', async (req, res) => {
  try {
    const { status, habitat_type, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }
    if (status) where.status = status;
    if (habitat_type) where.habitat_type = habitat_type;

    const devices = await db.Device.findAndCountAll({
      where,
      attributes: [
        'id', 'deviceId', 'name', 'description', 'habitat_type',
        'status', 'latitude', 'longitude', 'battery_percentage',
        'last_telemetry_at', 'createdAt'
      ],
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
      order: [['last_telemetry_at', 'DESC']]
    });

    res.json({
      success: true,
      total: devices.count,
      data: devices.rows
    });
  } catch (error) {
    console.error('Devices GET error:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

// GET /api/devices/:id - Get device details
router.get('/:id', async (req, res) => {
  try {
    const device = await db.Device.findByPk(req.params.id, {
      include: [
        {
          model: db.Telemetry,
          as: 'telemetry',
          limit: 10,
          order: [['createdAt', 'DESC']]
        },
        {
          model: db.Event,
          as: 'events',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && device.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      data: device
    });
  } catch (error) {
    console.error('Device GET error:', error);
    res.status(500).json({ error: 'Failed to fetch device' });
  }
});

// PUT /api/devices/:id - Update device
router.put('/:id', async (req, res) => {
  try {
    const device = await db.Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && device.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description, status, habitat_type, latitude, longitude } = req.body;

    await device.update({
      name: name || device.name,
      description: description || device.description,
      status: status || device.status,
      habitat_type: habitat_type || device.habitat_type,
      latitude: latitude || device.latitude,
      longitude: longitude || device.longitude
    });

    res.json({
      success: true,
      message: 'Device updated',
      data: device
    });
  } catch (error) {
    console.error('Device update error:', error);
    res.status(500).json({ error: 'Failed to update device' });
  }
});

// DELETE /api/devices/:id - Delete device
router.delete('/:id', async (req, res) => {
  try {
    const device = await db.Device.findByPk(req.params.id);

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && device.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await device.destroy();

    res.json({
      success: true,
      message: 'Device deleted'
    });
  } catch (error) {
    console.error('Device delete error:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
});

module.exports = router;
