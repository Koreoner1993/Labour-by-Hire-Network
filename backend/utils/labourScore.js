'use strict';

/**
 * Labour Score — 0 to 100
 *
 * Breakdown (100 pts total):
 *   Identity completeness   30 pts
 *   Credentials             25 pts
 *   Wallet connected         5 pts
 *   Platform tenure         25 pts
 *   Active listing           15 pts
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

  // ── Wallet connected (5 pts) ────────────────────────────────────────────
  if (worker.wallet_address) score += 5;

  // ── Platform tenure (25 pts) ────────────────────────────────────────────
  if (worker.created_at) {
    const days = (Date.now() - new Date(worker.created_at).getTime()) / 86_400_000;
    if (days >= 365)      score += 25;
    else if (days >= 180) score += 18;
    else if (days >= 30)  score += 10;
    else if (days >= 7)   score += 4;
  }

  // ── Active listing (15 pts) ─────────────────────────────────────────────
  if (hasListing) score += 15;

  return Math.min(100, Math.max(0, score));
}

module.exports = { calculateLabourScore };
