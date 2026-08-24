const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireRole } = require('../middleware/auth');

// GET /api/users/profile - Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await db.User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'first_name', 'last_name', 'organization', 'role', 'last_login_at', 'createdAt'],
      include: [{
        model: db.Device,
        as: 'devices',
        attributes: ['id', 'deviceId', 'name', 'status']
      }]
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('User profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { first_name, last_name, organization } = req.body;

    const user = await db.User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.update({
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      organization: organization || user.organization
    });

    res.json({
      success: true,
      message: 'Profile updated',
      data: user
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users - List all users (admin only)
router.get('/', requireRole(['admin']), async (req, res) => {
  try {
    const { role, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (role) where.role = role;

    const users = await db.User.findAndCountAll({
      where,
      attributes: ['id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'createdAt'],
      limit: Math.min(parseInt(limit), 100),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      total: users.count,
      data: users.rows
    });
  } catch (error) {
    console.error('Users GET error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
