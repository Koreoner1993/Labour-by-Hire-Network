const Worker = require('../models/worker');
const Listing = require('../models/listing');
const { calculateLabourScore } = require('../utils/labourScore');

// Get current worker profile
const getProfile = async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found', code: 'NOT_FOUND' });
    }

    const { password_hash, ...workerData } = worker;
    res.json({
      message: 'Profile retrieved',
      worker: workerData,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Update worker profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, city, hourlyRate, bio, licenceNumber, whiteCard } = req.body;

    const updates = {};
    if (firstName) updates.first_name = firstName;
    if (lastName) updates.last_name = lastName;
    if (city) updates.city = city;
    if (hourlyRate) updates.hourly_rate = hourlyRate;
    if (bio !== undefined) updates.bio = bio;
    if (licenceNumber !== undefined) updates.licence_number = licenceNumber || null;
    if (whiteCard !== undefined) updates.white_card = whiteCard || null;

    const worker = await Worker.update(req.worker.id, updates);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found', code: 'NOT_FOUND' });
    }

    // Recalculate score after profile update
    const listing = await Listing.getByWorkerId(req.worker.id).catch(() => null);
    const score = calculateLabourScore(worker, !!listing);
    await Worker.updateScore(req.worker.id, score);

    const { password_hash, ...workerData } = { ...worker, labour_score: score };
    res.json({
      message: 'Profile updated successfully',
      worker: workerData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Create or update listing
const createListing = async (req, res) => {
  try {
    const { title, description, skills, availability } = req.body;

    // Check if worker already has a listing
    const existing = await Listing.getByWorkerId(req.worker.id);
    if (existing) {
      // Update existing
      const updated = await Listing.update(existing.id, {
        title,
        description,
        skills,
        availability,
      });
      return res.json({
        message: 'Listing updated successfully',
        listing: updated,
      });
    }

    // Create new
    const listing = await Listing.create(
      req.worker.id,
      title,
      description,
      skills,
      availability
    );

    // Recalculate Labour Score — listing adds 10 pts
    const worker = await Worker.findById(req.worker.id);
    const score = calculateLabourScore(worker, true);
    await Worker.updateScore(req.worker.id, score);

    res.status(201).json({
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Get worker's listing
const getListing = async (req, res) => {
  try {
    const listing = await Listing.getByWorkerId(req.worker.id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found', code: 'NOT_FOUND' });
    }

    res.json({
      message: 'Listing retrieved',
      listing,
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  createListing,
  getListing,
};
