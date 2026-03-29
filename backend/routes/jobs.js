const express = require('express');
const Job = require('../models/job');
const Notification = require('../models/notification');
const Worker = require('../models/worker');

const router = express.Router();

// Create a new job (public - Phase 1)
router.post('/', async (req, res) => {
  try {
    const { title, description, tradeRequired, location, budget, urgency } = req.body;

    // Validation
    if (!title || !tradeRequired || !location) {
      return res.status(400).json({ error: 'Missing required fields', code: 'MISSING_FIELDS' });
    }

    // Create job
    const job = await Job.create(
      `employer_${Date.now()}`, // Mock employer ID for Phase 1
      title,
      description,
      tradeRequired,
      location,
      budget || 0,
      urgency || 'normal'
    );

    // Auto-generate notifications for matching workers
    if (urgency === 'urgent') {
      const matchingWorkers = await Worker.getAll();
      const filteredWorkers = matchingWorkers.filter(
        w => w.trade.toLowerCase() === tradeRequired.toLowerCase()
      );

      for (const worker of filteredWorkers) {
        await Notification.create(worker.id, job.id, 'urgent_job_match');
      }
    }

    res.status(201).json({
      message: 'Job posted successfully',
      job,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const { trade, location, urgency } = req.query;
    const allJobs = await Job.getAll();

    // Filter
    let filtered = allJobs;
    if (trade) {
      filtered = filtered.filter(j => j.trade_required.toLowerCase().includes(trade.toLowerCase()));
    }
    if (location) {
      filtered = filtered.filter(j => j.location.toLowerCase().includes(location.toLowerCase()));
    }
    if (urgency) {
      filtered = filtered.filter(j => j.urgency === urgency);
    }

    res.json({
      message: 'Jobs retrieved',
      count: filtered.length,
      jobs: filtered,
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// Get single job
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(parseInt(req.params.id));
    if (!job) {
      return res.status(404).json({ error: 'Job not found', code: 'NOT_FOUND' });
    }

    res.json({
      message: 'Job retrieved',
      job,
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
