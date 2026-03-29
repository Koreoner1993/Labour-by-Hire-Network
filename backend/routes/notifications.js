const express = require('express');
const Notification = require('../models/notification');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get notifications for current worker
router.get('/', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.getByWorkerId(req.worker.id);

    res.json({
      message: 'Notifications retrieved',
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get unread notifications
router.get('/unread', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.getUnreadByWorkerId(req.worker.id);

    res.json({
      message: 'Unread notifications retrieved',
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Get unread error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const notification = await Notification.markAsRead(parseInt(req.params.id));
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found', code: 'NOT_FOUND' });
    }

    res.json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
