// PostgreSQL Notification Model

const pool = require('../db/postgres');

// Helper: produce a $N placeholder
const p = n => ['$', n].join('');

const Notification = {
  // Create a new notification
  create: async (workerId, jobId, type = 'job_match') => {
    try {
      const { rows } = await pool.query(
        'INSERT INTO notifications (worker_id, job_id, type, is_read) VALUES (' + p(1) + ', ' + p(2) + ', ' + p(3) + ', FALSE) RETURNING *',
        [workerId, jobId, type]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to create notification: ' + error.message);
    }
  },

  // Get notifications for worker
  getByWorkerId: async (workerId) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM notifications WHERE worker_id = ' + p(1) + ' ORDER BY created_at DESC',
        [workerId]
      );
      return rows;
    } catch (error) {
      throw new Error('Failed to get notifications: ' + error.message);
    }
  },

  // Get unread notifications for worker
  getUnreadByWorkerId: async (workerId) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM notifications WHERE worker_id = ' + p(1) + ' AND is_read = FALSE ORDER BY created_at DESC',
        [workerId]
      );
      return rows;
    } catch (error) {
      throw new Error('Failed to get unread notifications: ' + error.message);
    }
  },

  // Find notification by ID
  findById: async (id) => {
    try {
      const { rows } = await pool.query('SELECT * FROM notifications WHERE id = ' + p(1), [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to find notification: ' + error.message);
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const { rows } = await pool.query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ' + p(1) + ' RETURNING *',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to mark as read: ' + error.message);
    }
  },

  // Delete notification
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM notifications WHERE id = ' + p(1), [id]);
      return true;
    } catch (error) {
      throw new Error('Failed to delete notification: ' + error.message);
    }
  },
};

module.exports = Notification;
