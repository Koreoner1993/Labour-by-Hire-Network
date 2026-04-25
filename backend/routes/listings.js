'use strict';

const express = require('express');
const Listing = require('../models/listing');
const Worker = require('../models/worker');

const router = express.Router();

/** Safe public worker shape — no password or email */
function publicWorker(w) {
  return {
    id: w.id,
    name: `${w.first_name} ${w.last_name}`,
    first_name: w.first_name,
    last_name: w.last_name,
    trade: w.trade,
    city: w.city,
    hourly_rate: w.hourly_rate,
    bio: w.bio,
    labour_score: w.labour_score || 0,
    licence_number: w.licence_number ? '✓ Verified' : null,  // mask the actual number
    white_card: w.white_card ? '✓ Verified' : null,
    wallet_address: w.wallet_address || null,
    created_at: w.created_at,
  };
}

// GET /api/listings  — public browse
router.get('/', async (req, res) => {
  try {
    const { trade, city, maxRate } = req.query;

    // Fetch all listings with their workers in one pass
    const allListings = await Listing.getAll();
    const workerIds = [...new Set(allListings.map(l => l.worker_id))];
    const workerMap = {};
    await Promise.all(workerIds.map(async (id) => {
      const w = await Worker.findById(id);
      if (w) workerMap[id] = w;
    }));

    let enriched = allListings
      .filter(l => workerMap[l.worker_id])
      .map(l => ({ ...l, worker: publicWorker(workerMap[l.worker_id]) }));

    // Apply filters synchronously now that worker data is in memory
    if (trade && trade !== 'All') {
      enriched = enriched.filter(l => l.worker.trade.toLowerCase().includes(trade.toLowerCase()));
    }
    if (city) {
      enriched = enriched.filter(l => l.worker.city && l.worker.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (maxRate) {
      enriched = enriched.filter(l => l.worker.hourly_rate && l.worker.hourly_rate <= parseInt(maxRate));
    }

    res.json({ message: 'Listings retrieved', count: enriched.length, listings: enriched });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/listings/:id  — single listing with full worker data
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(parseInt(req.params.id));
    if (!listing) return res.status(404).json({ error: 'Listing not found', code: 'NOT_FOUND' });

    const worker = await Worker.findById(listing.worker_id);
    res.json({
      message: 'Listing retrieved',
      listing: { ...listing, worker: publicWorker(worker) },
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
