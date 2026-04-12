'use strict';

/**
 * Labour Score — 0 to 100
 *
 * Soulbound NFT value on Hedera HTS. Computed server-side from verifiable
 * data points so it can't be gamed from the client.
 *
 * Breakdown (100 pts total):
 *   Identity completeness   30 pts
 *   Credentials             25 pts
 *   On-chain presence       20 pts
 *   Platform tenure         15 pts
 *   Active listing           10 pts
 */

/**
 * @param {object} worker   Row from workers table
 * @param {boolean} hasListing  Whether the worker has an active listing
 * @returns {number} 0–100
 */
function calculateLabourScore(worker, hasListing = false) {
  let score = 0;

  // ── Identity completeness (30 pts) ──────────────────────────────────────
  if (worker.first_name && worker.last_name) score += 8;
  if (worker.trade)                          score += 5;
  if (worker.city)                           score += 5;
  if (worker.bio && worker.bio.length >= 40) score += 7;
  if (worker.hourly_rate > 0)                score += 5;

  // ── Credentials (25 pts) ────────────────────────────────────────────────
  if (worker.licence_number) score += 15;
  if (worker.white_card)     score += 10;

  // ── On-chain presence (20 pts) ──────────────────────────────────────────
  if (worker.hedera_serial) score += 15;   // badge minted
  if (worker.wallet_address) score += 5;   // wallet connected

  // ── Platform tenure (15 pts) ────────────────────────────────────────────
  if (worker.created_at) {
    const days = (Date.now() - new Date(worker.created_at).getTime()) / 86_400_000;
    if (days >= 365)      score += 15;
    else if (days >= 180) score += 10;
    else if (days >= 30)  score += 5;
    else if (days >= 7)   score += 2;
  }

  // ── Active listing (10 pts) ─────────────────────────────────────────────
  if (hasListing) score += 10;

  return Math.min(100, Math.max(0, score));
}

module.exports = { calculateLabourScore };
