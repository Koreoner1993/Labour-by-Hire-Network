'use strict';

const crypto = require('crypto');
const Worker = require('../models/worker');
const { mintBadge } = require('../hedera/mintBadge');

/**
 * POST /api/nft/mint
 * Authenticated. Mints the caller's Hedera identity badge.
 *
 * - Builds a verification_hash from their profile data
 * - Calls the full mintBadge() pipeline (SVG → IPFS → HTS)
 * - Saves tokenId, serial, txId, URIs back to the worker record
 * - Returns the mint result
 *
 * Idempotent: if the worker already has a hedera_serial, returns
 * the existing badge info without minting again.
 */
const mint = async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker.id);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Already minted — return existing badge
    if (worker.hedera_serial) {
      return res.json({
        alreadyMinted: true,
        tokenId: worker.hedera_token_id,
        serial: worker.hedera_serial,
        transactionId: worker.hedera_tx_id,
        svgUri: worker.badge_svg_uri,
        metadataUri: worker.badge_metadata_uri,
        verificationHash: worker.verification_hash,
      });
    }

    // Build verification hash — SHA-256 of deterministic worker fields
    const hashInput = [
      worker.id,
      worker.email,
      worker.first_name,
      worker.last_name,
      worker.trade,
      worker.licence_number || '',
      worker.white_card || '',
      worker.created_at,
    ].join('|');
    const verificationHash = crypto.createHash('sha256').update(hashInput).digest('hex');

    const workerPayload = {
      name: `${worker.first_name} ${worker.last_name}`,
      trade: worker.trade,
      city: worker.city || 'Australia',
      licenceNumber: worker.licence_number || '—',
      whiteCard: worker.white_card || '—',
      labourScore: worker.labour_score || 0,
      verificationHash,
      issuedDate: new Date().toISOString().slice(0, 10),
    };

    const result = await mintBadge(workerPayload);

    // Persist to DB
    await Worker.saveHederaResult(worker.id, {
      verificationHash,
      tokenId: result.tokenId,
      serial: result.serial,
      txId: result.transactionId,
      metadataUri: result.metadataUri,
      svgUri: result.svgUri,
    });

    return res.status(201).json({
      alreadyMinted: false,
      tokenId: result.tokenId,
      serial: result.serial,
      transactionId: result.transactionId,
      svgUri: result.svgUri,
      metadataUri: result.metadataUri,
      verificationHash,
    });
  } catch (error) {
    console.error('Mint error:', error);
    return res.status(500).json({ error: 'Mint failed', message: error.message });
  }
};

/**
 * GET /api/nft/badge
 * Authenticated. Returns the caller's current badge data (if minted).
 */
const getBadge = async (req, res) => {
  try {
    const worker = await Worker.findById(req.worker.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    if (!worker.hedera_serial) {
      return res.json({ minted: false });
    }

    return res.json({
      minted: true,
      tokenId: worker.hedera_token_id,
      serial: worker.hedera_serial,
      transactionId: worker.hedera_tx_id,
      svgUri: worker.badge_svg_uri,
      metadataUri: worker.badge_metadata_uri,
      verificationHash: worker.verification_hash,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { mint, getBadge };
