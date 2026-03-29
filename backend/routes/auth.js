const express = require('express');
const { register, login } = require('../controllers/auth');
const { getProfile, updateProfile, createListing, getListing } = require('../controllers/workers');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);

// Protected worker routes
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/listing', authMiddleware, createListing);
router.get('/listing', authMiddleware, getListing);

module.exports = router;
