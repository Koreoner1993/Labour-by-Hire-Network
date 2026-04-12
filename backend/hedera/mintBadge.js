/**
 * Labour By Hire — Hedera Minting Pipeline
 *
 * Flow:
 *   1. Accept worker data + verification_hash
 *   2. Inject them into the SVG badge template
 *   3. Upload SVG + metadata JSON to IPFS (via Pinata)
 *   4. Mint the NFT on Hedera HTS (serial per worker)
 *
 * Requirements:
 *   npm install @hashgraph/sdk axios form-data dotenv
 *
 * .env keys needed:
 *   HEDERA_OPERATOR_ID        e.g. 0.0.12345
 *   HEDERA_OPERATOR_KEY       302e...  (DER-encoded ED25519 private key)
 *   HEDERA_NETWORK            testnet | mainnet
 *   HEDERA_TOKEN_ID           0.0.XXXXX  (pre-created HTS NFT token)
 *   PINATA_API_KEY
 *   PINATA_API_SECRET
 */

'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const {
  Client,
  TokenMintTransaction,
  PrivateKey,
  AccountId,
} = require('@hashgraph/sdk');
const axios = require('axios');
const FormData = require('form-data');

// ─────────────────────────────────────────────────────────────────────────────
// SVG TEMPLATE
// Inject worker data into the badge. Keep it a pure function so it's testable.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {object} worker
 * @param {string} worker.name            Full name
 * @param {string} worker.trade           e.g. "Electrician"
 * @param {string} worker.city            e.g. "Melbourne, VIC"
 * @param {string} worker.licenceNumber   e.g. "CL123456"
 * @param {string} worker.whiteCard       e.g. "WC987654"
 * @param {number} worker.labourScore     0–100
 * @param {string} worker.verificationHash  SHA-256 hex (64 chars)
 * @param {string} worker.issuedDate      ISO date string
 * @returns {string} SVG markup
 */
function buildBadgeSVG(worker) {
  const {
    name,
    trade,
    city,
    licenceNumber,
    whiteCard,
    labourScore,
    verificationHash,
    issuedDate,
  } = worker;

  // Score bar width (max 120px)
  const barWidth = Math.round((labourScore / 100) * 120);

  // Truncate hash for display (first 16 + last 8 chars)
  const hashShort = verificationHash
    ? `${verificationHash.slice(0, 16)}…${verificationHash.slice(-8)}`
    : 'N/A';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0d14"/>
      <stop offset="100%" stop-color="#12151f"/>
    </linearGradient>
    <linearGradient id="scoreBar" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#00b4a0"/>
      <stop offset="100%" stop-color="#00d2b9"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="400" height="240" rx="16" fill="url(#bg)"/>
  <rect width="400" height="240" rx="16" fill="none" stroke="#00d2b9" stroke-opacity="0.18" stroke-width="1"/>

  <!-- Header band -->
  <rect y="0" width="400" height="48" rx="0" fill="#00d2b9" fill-opacity="0.07"/>
  <rect x="16" y="14" width="4" height="20" rx="2" fill="#00d2b9"/>
  <text x="28" y="24" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="600"
        fill="#00d2b9" letter-spacing="2" text-transform="uppercase">LABOUR BY HIRE</text>
  <text x="28" y="38" font-family="'DM Sans', system-ui, sans-serif" font-size="8"
        fill="#9299aa" letter-spacing="1">CONSTRUCTION IDENTITY BADGE</text>

  <!-- Hedera logo area -->
  <text x="376" y="28" font-family="system-ui" font-size="18" text-anchor="end" fill="#00d2b9">🔷</text>

  <!-- Name -->
  <text x="24" y="76" font-family="'DM Sans', system-ui, sans-serif" font-size="20" font-weight="300"
        fill="#f0f2f5" letter-spacing="-0.5">${escapeXml(name)}</text>

  <!-- Trade + city -->
  <text x="24" y="94" font-family="'DM Sans', system-ui, sans-serif" font-size="11"
        fill="#9299aa" letter-spacing="0.5">${escapeXml(trade)}  ·  ${escapeXml(city)}</text>

  <!-- Divider -->
  <line x1="24" y1="104" x2="376" y2="104" stroke="#ffffff" stroke-opacity="0.06"/>

  <!-- Fields: Licence -->
  <text x="24" y="120" font-family="'DM Mono', monospace, sans-serif" font-size="8"
        fill="#5a6070" letter-spacing="1">LICENCE</text>
  <text x="24" y="132" font-family="'DM Mono', monospace, sans-serif" font-size="11"
        fill="#f0f2f5">${escapeXml(licenceNumber || '—')}</text>

  <!-- Fields: White Card -->
  <text x="150" y="120" font-family="'DM Mono', monospace, sans-serif" font-size="8"
        fill="#5a6070" letter-spacing="1">WHITE CARD</text>
  <text x="150" y="132" font-family="'DM Mono', monospace, sans-serif" font-size="11"
        fill="#f0f2f5">${escapeXml(whiteCard || '—')}</text>

  <!-- Fields: Issued -->
  <text x="280" y="120" font-family="'DM Mono', monospace, sans-serif" font-size="8"
        fill="#5a6070" letter-spacing="1">ISSUED</text>
  <text x="280" y="132" font-family="'DM Mono', monospace, sans-serif" font-size="11"
        fill="#f0f2f5">${escapeXml(issuedDate || '—')}</text>

  <!-- Labour Score label -->
  <text x="24" y="156" font-family="'DM Sans', system-ui, sans-serif" font-size="8"
        fill="#5a6070" letter-spacing="1">LABOUR SCORE</text>
  <text x="152" y="156" font-family="'DM Sans', system-ui, sans-serif" font-size="8"
        font-weight="700" fill="#00d2b9">${labourScore}/100</text>

  <!-- Score bar background -->
  <rect x="24" y="160" width="120" height="5" rx="2.5" fill="#1e222e"/>
  <!-- Score bar fill -->
  <rect x="24" y="160" width="${barWidth}" height="5" rx="2.5" fill="url(#scoreBar)"/>

  <!-- Verification hash -->
  <text x="24" y="190" font-family="'DM Mono', monospace, sans-serif" font-size="7"
        fill="#5a6070" letter-spacing="0.5">VERIFICATION HASH</text>
  <text x="24" y="201" font-family="'DM Mono', monospace, sans-serif" font-size="8"
        fill="#9299aa">${hashShort}</text>

  <!-- LBH Verified badge -->
  <rect x="295" y="180" width="85" height="22" rx="11" fill="#00d2b9" fill-opacity="0.1"
        stroke="#00d2b9" stroke-opacity="0.3" stroke-width="0.5"/>
  <text x="337" y="195" font-family="'DM Sans', system-ui, sans-serif" font-size="8"
        font-weight="600" fill="#00d2b9" text-anchor="middle" letter-spacing="0.5">LBH VERIFIED</text>

  <!-- Bottom border accent -->
  <rect x="24" y="228" width="80" height="2" rx="1" fill="#00d2b9" fill-opacity="0.4"/>
</svg>`;
}

/** Escape special XML characters for safe SVG text embedding */
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ─────────────────────────────────────────────────────────────────────────────
// IPFS UPLOAD (Pinata)
// ─────────────────────────────────────────────────────────────────────────────

const PINATA_BASE = 'https://api.pinata.cloud';

/**
 * Upload a Buffer/string to IPFS via Pinata.
 * Returns the IPFS CID (v1).
 * @param {Buffer|string} content
 * @param {string} filename
 * @param {object} metadata  Pinata keyvalue metadata
 * @returns {Promise<string>} ipfs://CID
 */
async function uploadToIPFS(content, filename, metadata = {}) {
  const form = new FormData();
  form.append('file', Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf-8'), {
    filename,
    contentType: filename.endsWith('.svg') ? 'image/svg+xml' : 'application/json',
  });
  form.append(
    'pinataMetadata',
    JSON.stringify({ name: filename, keyvalues: metadata })
  );
  form.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

  const response = await axios.post(`${PINATA_BASE}/pinning/pinFileToIPFS`, form, {
    maxBodyLength: Infinity,
    headers: {
      ...form.getHeaders(),
      pinata_api_key: process.env.PINATA_API_KEY,
      pinata_secret_api_key: process.env.PINATA_API_SECRET,
    },
  });

  return `ipfs://${response.data.IpfsHash}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// HEDERA MINT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialise a Hedera client from env vars.
 */
function buildHederaClient() {
  const operatorId = AccountId.fromString(process.env.HEDERA_OPERATOR_ID);
  const operatorKey = PrivateKey.fromString(process.env.HEDERA_OPERATOR_KEY);

  const network = (process.env.HEDERA_NETWORK || 'testnet').toLowerCase();
  const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
  client.setOperator(operatorId, operatorKey);
  return client;
}

/**
 * Mint one NFT serial on the HTS token.
 * HTS metadata field = IPFS URI of the JSON metadata (max 100 bytes).
 *
 * @param {string} metadataUri  e.g. "ipfs://bafyrei..."
 * @returns {Promise<{tokenId: string, serial: number, transactionId: string}>}
 */
async function mintNFT(metadataUri) {
  const client = buildHederaClient();

  const metadataBytes = Buffer.from(metadataUri, 'utf-8');
  if (metadataBytes.length > 100) {
    throw new Error(`Metadata URI too long for HTS (${metadataBytes.length} bytes, max 100)`);
  }

  const tx = await new TokenMintTransaction()
    .setTokenId(process.env.HEDERA_TOKEN_ID)
    .addMetadata(metadataBytes)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  const serial = receipt.serials[0].toNumber();

  return {
    tokenId: process.env.HEDERA_TOKEN_ID,
    serial,
    transactionId: tx.transactionId.toString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PIPELINE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full pipeline: SVG → IPFS → Hedera mint.
 *
 * @param {object} worker  See buildBadgeSVG() for shape
 * @returns {Promise<object>} Mint result + IPFS URIs
 *
 * Example:
 *   const result = await mintBadge({
 *     name: 'Jordan Smith',
 *     trade: 'Electrician',
 *     city: 'Melbourne, VIC',
 *     licenceNumber: 'CL123456',
 *     whiteCard: 'WC987654',
 *     labourScore: 72,
 *     verificationHash: 'a3f8...c1d2',
 *     issuedDate: '2025-04-12',
 *   });
 */
async function mintBadge(worker) {
  if (!worker.verificationHash) {
    throw new Error('verificationHash is required');
  }

  // 1. Build SVG
  console.log('[1/4] Building badge SVG…');
  const svg = buildBadgeSVG(worker);

  // 2. Upload SVG to IPFS
  console.log('[2/4] Uploading SVG to IPFS…');
  const svgUri = await uploadToIPFS(svg, `lbh-badge-${worker.verificationHash.slice(0, 8)}.svg`, {
    worker: worker.name,
    hash: worker.verificationHash,
  });
  console.log(`      SVG URI: ${svgUri}`);

  // 3. Build and upload metadata JSON (HIP-412 compatible)
  console.log('[3/4] Uploading metadata JSON to IPFS…');
  const metadata = {
    name: `LBH Construction ID — ${worker.name}`,
    description: `Labour By Hire verified construction identity badge for ${worker.name} (${worker.trade}, ${worker.city}).`,
    image: svgUri,
    type: 'image/svg+xml',
    properties: {
      trade: worker.trade,
      city: worker.city,
      licenceNumber: worker.licenceNumber,
      whiteCard: worker.whiteCard,
      labourScore: worker.labourScore,
      verificationHash: worker.verificationHash,
      issuedDate: worker.issuedDate,
      platform: 'Labour By Hire',
      chain: 'Hedera',
    },
  };
  const metadataUri = await uploadToIPFS(
    JSON.stringify(metadata, null, 2),
    `lbh-meta-${worker.verificationHash.slice(0, 8)}.json`,
    { worker: worker.name }
  );
  console.log(`      Metadata URI: ${metadataUri}`);

  // 4. Mint on Hedera HTS
  console.log('[4/4] Minting NFT on Hedera…');
  const mintResult = await mintNFT(metadataUri);
  console.log(`      Token: ${mintResult.tokenId}  Serial: ${mintResult.serial}`);
  console.log(`      TX: ${mintResult.transactionId}`);

  return {
    ...mintResult,
    svgUri,
    metadataUri,
    worker: worker.name,
    verificationHash: worker.verificationHash,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// CLI USAGE  (node mintBadge.js)
// ─────────────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const sample = {
    name: 'Jordan Smith',
    trade: 'Electrician',
    city: 'Melbourne, VIC',
    licenceNumber: 'CL123456',
    whiteCard: 'WC987654',
    labourScore: 72,
    verificationHash: 'a3f8c1d2e4b56789abcdef01234567890abcdef01234567890abcdef01234567',
    issuedDate: new Date().toISOString().slice(0, 10),
  };

  mintBadge(sample)
    .then((result) => {
      console.log('\n✅ Minted successfully:');
      console.log(JSON.stringify(result, null, 2));
    })
    .catch((err) => {
      console.error('\n❌ Mint failed:', err.message);
      process.exit(1);
    });
}

module.exports = { mintBadge, buildBadgeSVG, uploadToIPFS };
