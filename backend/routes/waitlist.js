'use strict';

const express = require('express');
const db = require('../db/sqlite');

const router = express.Router();

// POST /api/waitlist  — join spotlight waitlist (public)
router.post('/', async (req, res) => {
  try {
    const { email, source = 'spotlight' } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const existing = await db.prepare('SELECT id FROM waitlist WHERE email = $1').get(email.toLowerCase().trim());
    if (existing) {
      return res.json({ message: 'Already on the waitlist', alreadyJoined: true });
    }

    await db.prepare('INSERT INTO waitlist (email, source) VALUES ($1, $2)').run(email.toLowerCase().trim(), source);
    const countResult = await db.prepare('SELECT COUNT(*) as n FROM waitlist').get();
    const count = countResult.count || countResult.n;

    return res.status(201).json({ message: 'Added to waitlist', position: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/waitlist/count  — public count (shown on Spotlight page)
router.get('/count', async (_req, res) => {
  try {
    const result = await db.prepare('SELECT COUNT(*) as n FROM waitlist').get();
    const count = result.count || result.n;
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
