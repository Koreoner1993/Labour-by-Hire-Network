'use strict';

const express = require('express');
const pool = require('../db/postgres');

// Helper: produce a $N placeholder
const p = n => ['$', n].join('');

const router = express.Router();

// POST /api/waitlist  — join spotlight waitlist (public)
router.post('/', async (req, res) => {
  try {
    const { email, source = 'spotlight' } = req.body;
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Valid email required' });
    }

    const normalised = email.toLowerCase().trim();

    const { rows: existing } = await pool.query(
      'SELECT id FROM waitlist WHERE email = ' + p(1),
      [normalised]
    );
    if (existing[0]) {
      return res.json({ message: 'Already on the waitlist', alreadyJoined: true });
    }

    await pool.query(
      'INSERT INTO waitlist (email, source) VALUES (' + p(1) + ', ' + p(2) + ')',
      [normalised, source]
    );

    const { rows: countRows } = await pool.query('SELECT COUNT(*) as n FROM waitlist');
    const count = parseInt(countRows[0].n, 10);

    return res.status(201).json({ message: 'Added to waitlist', position: count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/waitlist/count  — public count (shown on Spotlight page)
router.get('/count', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) as n FROM waitlist');
    res.json({ count: parseInt(rows[0].n, 10) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
