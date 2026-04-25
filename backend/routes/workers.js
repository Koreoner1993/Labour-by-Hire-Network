'use strict';

const express = require('express');
const Worker = require('../models/worker');
const Listing = require('../models/listing');

const router = express.Router();

// GET /api/workers/:id  — public profile by worker ID
router.get('/:id', async (req, res) => {
  try {
    const worker = await Worker.findById(parseInt(req.params.id));
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const listing = await Listing.getByWorkerId(worker.id).catch(() => null);

    res.json({
      worker: {
        id: worker.id,
        name: `${worker.first_name} ${worker.last_name}`,
        first_name: worker.first_name,
        last_name: worker.last_name,
        trade: worker.trade,
        city: worker.city,
        hourly_rate: worker.hourly_rate,
        bio: worker.bio,
        labour_score: worker.labour_score || 0,
        licence_verified: !!worker.licence_number,
        white_card_verified: !!worker.white_card,
        wallet_address: worker.wallet_address || null,
        created_at: worker.created_at,
      },
      listing: listing || null,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
