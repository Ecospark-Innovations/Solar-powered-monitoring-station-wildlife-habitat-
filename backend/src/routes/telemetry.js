const express = require('express');
const router = express.Router();
const db = require('../db');
const Joi = require('joi');
const { Op } = require('sequelize');

// Validation schema
const telemetrySchema = Joi.object({
  device_id: Joi.string().required(),
  temperature: Joi.number().required(),
  humidity: Joi.number().required(),
  pressure: Joi.number().required(),
  voc: Joi.number(),
  pm25: Joi.number(),
  pm10: Joi.number(),
  uv_index: Joi.number(),
  battery_voltage: Joi.number(),
  solar_voltage: Joi.number(),
  motion_detected: Joi.boolean()
});

// POST /api/telemetry - Receive telemetry data from device
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = telemetrySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find device
    const device = await db.Device.findOne({
      where: { deviceId: value.device_id }
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Create telemetry record
    const telemetry = await db.Telemetry.create({
      deviceId: device.id,
      temperature: value.temperature,
      humidity: value.humidity,
      pressure: value.pressure,
      voc: value.voc,
      pm25: value.pm25,
      pm10: value.pm10,
      uv_index: value.uv_index,
      battery_voltage: value.battery_voltage,
      solar_voltage: value.solar_voltage,
      motion_detected: value.motion_detected,
      device_timestamp: new Date()
    });

    // Update device status
    await device.update({
      battery_voltage: value.battery_voltage,
      solar_voltage: value.solar_voltage,
      last_telemetry_at: new Date(),
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Telemetry recorded',
      data: telemetry
    });
  } catch (error) {
    console.error('Telemetry POST error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/telemetry - Query telemetry data
router.get('/', async (req, res) => {
  try {
    const { deviceId, startDate, endDate, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (deviceId) where.deviceId = deviceId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const telemetry = await db.Telemetry.findAndCountAll({
      where,
      include: [{
        model: db.Device,
        as: 'device',
        attributes: ['name', 'deviceId']
      }],
      order: [['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 1000),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      total: telemetry.count,
      data: telemetry.rows
    });
  } catch (error) {
    console.error('Telemetry GET error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/telemetry/:id - Get specific telemetry record
router.get('/:id', async (req, res) => {
  try {
    const telemetry = await db.Telemetry.findByPk(req.params.id, {
      include: [{
        model: db.Device,
        as: 'device'
      }]
    });

    if (!telemetry) {
      return res.status(404).json({ error: 'Telemetry record not found' });
    }

    res.json({
      success: true,
      data: telemetry
    });
  } catch (error) {
    console.error('Telemetry GET/:id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/telemetry/stats/summary - Get telemetry summary stats
router.get('/stats/summary', async (req, res) => {
  try {
    const { deviceId, days = 7 } = req.query;
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const where = { createdAt: { [Op.gte]: startDate } };
    if (deviceId) where.deviceId = deviceId;

    const { sequelize } = db;
    const stats = await db.Telemetry.findAll({
      attributes: [
        [sequelize.fn('AVG', sequelize.col('temperature')), 'avg_temp'],
        [sequelize.fn('MIN', sequelize.col('temperature')), 'min_temp'],
        [sequelize.fn('MAX', sequelize.col('temperature')), 'max_temp'],
        [sequelize.fn('AVG', sequelize.col('humidity')), 'avg_humidity'],
        [sequelize.fn('AVG', sequelize.col('pm25')), 'avg_pm25']
      ],
      where,
      raw: true
    });

    res.json({
      success: true,
      period_days: days,
      data: stats[0]
    });
  } catch (error) {
    console.error('Telemetry stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
