// Mock Notification Model - Phase 1 (no database yet)
// Will be replaced with real database queries in Phase 2 Part 3

const notifications = {}; // In-memory storage
let nextNotificationId = 1;

const Notification = {
  // Create a new notification
  create: async (workerId, jobId, type = 'job_match') => {
    const id = nextNotificationId++;
    const notification = {
      id,
      worker_id: workerId,
      job_id: jobId,
      type,
      is_read: false,
      created_at: new Date(),
    };
    notifications[id] = notification;
    return notification;
  },

  // Get notifications for worker
  getByWorkerId: async (workerId) => {
    return Object.values(notifications)
      .filter(n => n.worker_id === workerId)
      .sort((a, b) => b.created_at - a.created_at);
  },

  // Get unread notifications for worker
  getUnreadByWorkerId: async (workerId) => {
    return Object.values(notifications).filter(
      n => n.worker_id === workerId && !n.is_read
    );
  },

  // Mark notification as read
  markAsRead: async (id) => {
    if (!notifications[id]) return null;
    notifications[id].is_read = true;
    return notifications[id];
  },

  // Delete notification
  delete: async (id) => {
    delete notifications[id];
    return true;
  },
};

module.exports = Notification;
