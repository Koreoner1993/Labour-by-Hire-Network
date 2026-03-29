const express = require('express');
const Listing = require('../models/listing');
const Worker = require('../models/worker');

const router = express.Router();

// Get all listings (public)
router.get('/', async (req, res) => {
  try {
    const { trade, city, maxRate } = req.query;
    const allListings = await Listing.getAll();

    // Filter by trade
    let filtered = allListings;
    if (trade) {
      const worker = await Worker.findById(filtered[0]?.worker_id);
      filtered = filtered.filter(async (l) => {
        const w = await Worker.findById(l.worker_id);
        return w && w.trade.toLowerCase().includes(trade.toLowerCase());
      });
    }

    // Filter by city
    if (city) {
      filtered = filtered.filter(async (l) => {
        const w = await Worker.findById(l.worker_id);
        return w && w.city.toLowerCase().includes(city.toLowerCase());
      });
    }

    // Filter by rate
    if (maxRate) {
      filtered = filtered.filter(async (l) => {
        const w = await Worker.findById(l.worker_id);
        return w && w.hourly_rate <= parseInt(maxRate);
      });
    }

    // Enrich listings with worker data
    const enriched = await Promise.all(
      filtered.map(async (listing) => {
        const worker = await Worker.findById(listing.worker_id);
        return {
          ...listing,
          worker: {
            id: worker.id,
            name: `${worker.first_name} ${worker.last_name}`,
            trade: worker.trade,
            city: worker.city,
            hourly_rate: worker.hourly_rate,
          },
        };
      })
    );

    res.json({
      message: 'Listings retrieved',
      count: enriched.length,
      listings: enriched,
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get single listing
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(parseInt(req.params.id));
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found', code: 'NOT_FOUND' });
    }

    const worker = await Worker.findById(listing.worker_id);
    const enriched = {
      ...listing,
      worker: {
        id: worker.id,
        name: `${worker.first_name} ${worker.last_name}`,
        trade: worker.trade,
        city: worker.city,
        hourly_rate: worker.hourly_rate,
        bio: worker.bio,
      },
    };

    res.json({
      message: 'Listing retrieved',
      listing: enriched,
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
