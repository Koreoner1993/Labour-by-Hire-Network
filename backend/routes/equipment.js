const express = require('express');
const Equipment = require('../models/equipment');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/equipment — public browse with optional filters
router.get('/', async (req, res) => {
  try {
    const { category, location, maxRate } = req.query;
    const items = await Equipment.getAll({ category, location, maxRate });
    res.json({ message: 'Equipment listings retrieved', count: items.length, equipment: items });
  } catch (error) {
    console.error('Get equipment error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// GET /api/equipment/:id — public single item
router.get('/:id', async (req, res) => {
  try {
    const item = await Equipment.findById(parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Equipment listing not found', code: 'NOT_FOUND' });
    res.json({ message: 'Equipment listing retrieved', equipment: item });
  } catch (error) {
    console.error('Get equipment item error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// POST /api/equipment — create listing (auth required)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, category, description, daily_rate, location, condition, availability } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
    if (!category || !category.trim()) return res.status(400).json({ error: 'Category is required' });
    if (!daily_rate || isNaN(daily_rate) || parseFloat(daily_rate) <= 0) {
      return res.status(400).json({ error: 'A valid daily rate is required' });
    }

    const item = await Equipment.create(
      req.worker.id,
      title.trim(),
      category.trim(),
      description ? description.trim() : null,
      parseFloat(daily_rate),
      location ? location.trim() : null,
      condition || 'Good',
      availability ? availability.trim() : 'Available'
    );

    res.status(201).json({ message: 'Equipment listing created', equipment: item });
  } catch (error) {
    console.error('Create equipment error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// PUT /api/equipment/:id — update listing (auth required, owner only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Equipment.findById(parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Equipment listing not found', code: 'NOT_FOUND' });
    if (item.owner_id !== req.worker.id) return res.status(403).json({ error: 'Not authorised to edit this listing' });

    const { title, category, description, daily_rate, location, condition, availability, active } = req.body;
    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (category !== undefined) updates.category = category.trim();
    if (description !== undefined) updates.description = description ? description.trim() : null;
    if (daily_rate !== undefined) updates.daily_rate = parseFloat(daily_rate);
    if (location !== undefined) updates.location = location ? location.trim() : null;
    if (condition !== undefined) updates.condition = condition;
    if (availability !== undefined) updates.availability = availability ? availability.trim() : null;
    if (active !== undefined) updates.active = active ? 1 : 0;

    const updated = await Equipment.update(parseInt(req.params.id), updates);
    res.json({ message: 'Equipment listing updated', equipment: updated });
  } catch (error) {
    console.error('Update equipment error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

// DELETE /api/equipment/:id — delete listing (auth required, owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const item = await Equipment.findById(parseInt(req.params.id));
    if (!item) return res.status(404).json({ error: 'Equipment listing not found', code: 'NOT_FOUND' });
    if (item.owner_id !== req.worker.id) return res.status(403).json({ error: 'Not authorised to delete this listing' });

    await Equipment.delete(parseInt(req.params.id));
    res.json({ message: 'Equipment listing deleted' });
  } catch (error) {
    console.error('Delete equipment error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

module.exports = router;
