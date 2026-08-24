const express = require('express');
const router = express.Router();
const db = require('../db');
const { Op } = require('sequelize');
const Joi = require('joi');

const telemetrySchema = Joi.object({
  device_id: Joi.string().required(),
  temperature: Joi.number(),
  humidity: Joi.number(),
  pressure: Joi.number(),
  voc: Joi.number(),
  pm25: Joi.number(),
  pm10: Joi.number(),
  uv_index: Joi.number(),
  battery_voltage: Joi.number(),
  solar_voltage: Joi.number(),
  motion_detected: Joi.boolean(),
  signal_strength: Joi.number()
});

// POST /api/telemetry - Submit telemetry data
router.post('/', async (req, res) => {
  try {
    const { error, value } = telemetrySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const device = await db.Device.findOne({
      where: { deviceId: value.device_id }
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

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
      signal_strength: value.signal_strength
    });

    // Update device last telemetry timestamp
    await device.update({ last_telemetry_at: new Date() });

    res.status(201).json({
      success: true,
      message: 'Telemetry recorded',
      data: telemetry
    });
  } catch (error) {
    console.error('Telemetry error:', error);
    res.status(500).json({ error: 'Failed to record telemetry' });
  }
});

// GET /api/telemetry - Query telemetry data
router.get('/', async (req, res) => {
  try {
    const { deviceId, startDate, endDate, limit = 100, offset = 0 } = req.query;

    const where = {};
    if (deviceId) {
      const device = await db.Device.findOne({ where: { deviceId } });
      if (device) where.deviceId = device.id;
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const telemetry = await db.Telemetry.findAndCountAll({
      where,
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
    res.status(500).json({ error: 'Failed to fetch telemetry' });
  }
});

// GET /api/telemetry/stats/summary - Get aggregated statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { deviceId, days = 7 } = req.query;

    const where = {
      createdAt: {
        [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      }
    };

    if (deviceId) {
      const device = await db.Device.findOne({ where: { deviceId } });
      if (device) where.deviceId = device.id;
    }

    const telemetry = await db.Telemetry.findAll({
      where,
      attributes: ['temperature', 'humidity', 'pm25', 'pm10', 'battery_voltage']
    });

    const stats = {
      avg_temp: 0,
      min_temp: Infinity,
      max_temp: -Infinity,
      avg_humidity: 0,
      avg_pm25: 0,
      avg_battery: 0,
      total_readings: telemetry.length
    };

    if (telemetry.length > 0) {
      let tempSum = 0, humidSum = 0, pm25Sum = 0, batterySum = 0;
      telemetry.forEach(t => {
        if (t.temperature) {
          tempSum += t.temperature;
          stats.min_temp = Math.min(stats.min_temp, t.temperature);
          stats.max_temp = Math.max(stats.max_temp, t.temperature);
        }
        if (t.humidity) humidSum += t.humidity;
        if (t.pm25) pm25Sum += t.pm25;
        if (t.battery_voltage) batterySum += t.battery_voltage;
      });
      stats.avg_temp = (tempSum / telemetry.length).toFixed(2);
      stats.avg_humidity = (humidSum / telemetry.length).toFixed(2);
      stats.avg_pm25 = (pm25Sum / telemetry.length).toFixed(2);
      stats.avg_battery = (batterySum / telemetry.length).toFixed(2);
      if (stats.min_temp === Infinity) stats.min_temp = null;
    }

    res.json({
      success: true,
      period_days: days,
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;
