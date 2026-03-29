// SQLite Notification Model - Phase 2B

const db = require('../db/sqlite');

const Notification = {
  // Create a new notification
  create: async (workerId, jobId, type = 'job_match') => {
    try {
      const stmt = db.prepare(`
        INSERT INTO notifications (worker_id, job_id, type, is_read)
        VALUES (?, ?, ?, 0)
      `);
      const result = stmt.run(workerId, jobId, type);
      return Notification.findById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  },

  // Get notifications for worker
  getByWorkerId: async (workerId) => {
    try {
      const stmt = db.prepare(`
        SELECT * FROM notifications 
        WHERE worker_id = ? 
        ORDER BY created_at DESC
      `);
      return stmt.all(workerId);
    } catch (error) {
      throw new Error(`Failed to get notifications: ${error.message}`);
    }
  },

  // Get unread notifications for worker
  getUnreadByWorkerId: async (workerId) => {
    try {
      const stmt = db.prepare(`
        SELECT * FROM notifications 
        WHERE worker_id = ? AND is_read = 0
        ORDER BY created_at DESC
      `);
      return stmt.all(workerId);
    } catch (error) {
      throw new Error(`Failed to get unread notifications: ${error.message}`);
    }
  },

  // Find notification by ID
  findById: async (id) => {
    try {
      const stmt = db.prepare('SELECT * FROM notifications WHERE id = ?');
      return stmt.get(id) || null;
    } catch (error) {
      throw new Error(`Failed to find notification: ${error.message}`);
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const stmt = db.prepare(`
        UPDATE notifications 
        SET is_read = 1
        WHERE id = ?
      `);
      stmt.run(id);
      return Notification.findById(id);
    } catch (error) {
      throw new Error(`Failed to mark as read: ${error.message}`);
    }
  },

  // Delete notification
  delete: async (id) => {
    try {
      const stmt = db.prepare('DELETE FROM notifications WHERE id = ?');
      stmt.run(id);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  },
};

module.exports = Notification;
