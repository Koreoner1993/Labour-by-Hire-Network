'use strict';

const express = require('express');
const db = require('../db/sqlite');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// POST /api/messages/:workerId — send a message to a worker (no auth needed — employers enquire freely)
router.post('/:workerId', async (req, res) => {
  try {
    const workerId = parseInt(req.params.workerId);
    const { from_name, from_email, company, body } = req.body;

    if (!from_name || !from_email || !body) {
      return res.status(400).json({ error: 'from_name, from_email and body are required' });
    }
    if (!/\S+@\S+\.\S+/.test(from_email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (body.length > 2000) {
      return res.status(400).json({ error: 'Message too long (max 2000 chars)' });
    }

    // Verify worker exists
    const worker = db.prepare('SELECT id FROM workers WHERE id = ?').get(workerId);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const stmt = db.prepare(
      'INSERT INTO messages (worker_id, from_name, from_email, company, body) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(workerId, from_name.trim(), from_email.trim(), company?.trim() || null, body.trim());
    const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(result.lastInsertRowid);

    return res.status(201).json({ message: 'Message sent', data: msg });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/messages — get inbox for authenticated worker
router.get('/', authMiddleware, async (req, res) => {
  try {
    const messages = db
      .prepare('SELECT * FROM messages WHERE worker_id = ? ORDER BY created_at DESC')
      .all(req.worker.id);

    const formatted = messages.map(m => ({
      id: m.id,
      from_name: m.from_name,
      from_email: m.from_email,
      company: m.company,
      body: m.body,
      read: !!m.read,
      time: m.created_at,
    }));

    const unread = formatted.filter(m => !m.read).length;
    return res.json({ messages: formatted, unread });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// PUT /api/messages/:id/read — mark a message as read
router.put('/:id/read', authMiddleware, async (req, res) => {
  try {
    const msg = db.prepare('SELECT * FROM messages WHERE id = ?').get(parseInt(req.params.id));
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    if (msg.worker_id !== req.worker.id) return res.status(403).json({ error: 'Forbidden' });

    db.prepare('UPDATE messages SET read = 1 WHERE id = ?').run(msg.id);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
