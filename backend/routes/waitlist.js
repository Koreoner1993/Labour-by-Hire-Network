'use strict';

const express = require('express');
const db = require('../db/sqlite');

const router = express.Router();

// POST /api/waitlist  — join spotlight waitlist (public)
router.post('/', (req, res) => {
  try {
    const { email, source = 'spotlight' } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const existing = db.prepare('SELECT id FROM waitlist WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.json({ message: 'Already on the waitlist', alreadyJoined: true });
    }

    db.prepare('INSERT INTO waitlist (email, source) VALUES (?, ?)').run(email.toLowerCase().trim(), source);
    const count = db.prepare('SELECT COUNT(*) as n FROM waitlist').get().n;

    return res.status(201).json({ message: 'Added to waitlist', position: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/waitlist/count  — public count (shown on Spotlight page)
router.get('/count', (_req, res) => {
  try {
    const { n } = db.prepare('SELECT COUNT(*) as n FROM waitlist').get();
    res.json({ count: n });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
