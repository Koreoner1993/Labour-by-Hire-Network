'use strict';

const express = require('express');
const authMiddleware = require('../middleware/auth');
const { mint, getBadge } = require('../controllers/nft');

const router = express.Router();

// All NFT routes require a valid JWT
router.post('/mint', authMiddleware, mint);
router.get('/badge', authMiddleware, getBadge);

module.exports = router;
