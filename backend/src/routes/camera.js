const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../db');
const { Op } = require('sequelize');
const path = require('path');

// Configure multer for image uploads
const upload = multer({
  dest: 'uploads/camera/',
  limits: { fileSize: 10 * 1024 * 1024 },  // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// POST /api/camera/snapshot - Upload camera image
router.post('/snapshot', upload.single('image'), async (req, res) => {
  try {
    const { device_id, motion_triggered, is_night_vision } = req.body;

    if (!device_id || !req.file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const device = await db.Device.findOne({
      where: { deviceId: device_id }
    });

    if (!device) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Create camera image record
    const image = await db.CameraImage.create({
      deviceId: device.id,
      filename: req.file.filename,
      local_path: req.file.path,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      motion_triggered: motion_triggered === 'true',
      is_night_vision: is_night_vision === 'true',
      device_timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Image uploaded',
      data: {
        id: image.id,
        filename: image.filename,
        size: image.file_size,
        timestamp: image.createdAt
      }
    });
  } catch (error) {
    console.error('Camera upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// GET /api/camera/images/:deviceId - Get device camera images
router.get('/images/:deviceId', async (req, res) => {
  try {
    const { limit = 50, offset = 0, motion_only = false } = req.query;

    const where = { deviceId: req.params.deviceId };
    if (motion_only === 'true') {
      where.motion_triggered = true;
    }

    const images = await db.CameraImage.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset),
      attributes: ['id', 'filename', 'file_size', 'motion_triggered', 'is_night_vision', 'createdAt']
    });

    res.json({
      success: true,
      total: images.count,
      data: images.rows
    });
  } catch (error) {
    console.error('Camera images GET error:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// GET /api/camera/image/:id - Get specific image
router.get('/image/:id', async (req, res) => {
  try {
    const image = await db.CameraImage.findByPk(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // TODO: Serve image from S3 or local storage
    res.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error('Camera image GET error:', error);
    res.status(500).json({ error: 'Failed to fetch image' });
  }
});

module.exports = router;
