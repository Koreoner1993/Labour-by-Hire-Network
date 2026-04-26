// SQLite Worker Model - Phase 2B

const db = require('../db/sqlite');

const Worker = {
  // Create a new worker
  create: async (email, passwordHash, firstName, lastName, trade, city, hourlyRate, bio, licenceNumber, whiteCard, walletAddress) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO workers (email, password_hash, first_name, last_name, trade, city, hourly_rate, bio, licence_number, white_card, wallet_address)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `);
      const result = await stmt.run(email, passwordHash, firstName, lastName, trade, city, hourlyRate || 0, bio, licenceNumber || null, whiteCard || null, walletAddress || null);
      return Worker.findById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create worker: ${error.message}`);
    }
  },

  // Find worker by email
  findByEmail: async (email) => {
    try {
      const stmt = db.prepare('SELECT * FROM workers WHERE email = $1');
      return await stmt.get(email) || null;
    } catch (error) {
      throw new Error(`Failed to find worker: ${error.message}`);
    }
  },

  // Find worker by ID
  findById: async (id) => {
    try {
      const stmt = db.prepare('SELECT * FROM workers WHERE id = $1');
      return await stmt.get(id) || null;
    } catch (error) {
      throw new Error(`Failed to find worker: ${error.message}`);
    }
  },

  // Get all workers (for browsing)
  getAll: async () => {
    try {
      const stmt = db.prepare('SELECT * FROM workers ORDER BY created_at DESC');
      return await stmt.all();
    } catch (error) {
      throw new Error(`Failed to get workers: ${error.message}`);
    }
  },

  // Update worker
  update: async (id, updates) => {
    try {
      const allowedFields = ['first_name', 'last_name', 'city', 'hourly_rate', 'bio', 'licence_number', 'white_card'];
      const setClause = allowedFields
        .filter(field => field in updates)
        .map((field, idx) => `${field} = $${idx + 1}`)
        .join(', ');

      if (!setClause) return Worker.findById(id);

      const values = allowedFields
        .filter(field => field in updates)
        .map(field => updates[field]);

      const stmt = db.prepare(`
        UPDATE workers
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length + 1}
      `);
      await stmt.run(...values, id);
      return Worker.findById(id);
    } catch (error) {
      throw new Error(`Failed to update worker: ${error.message}`);
    }
  },

  // Update labour_score
  updateScore: async (id, score) => {
    try {
      const stmt = db.prepare('UPDATE workers SET labour_score = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2');
      await stmt.run(score, id);
    } catch (error) {
      throw new Error(`Failed to update score: ${error.message}`);
    }
  },

  // Safe public fields (no password_hash, no email)
  toPublic: (worker) => {
    if (!worker) return null;
    const { password_hash, email, ...pub } = worker;
    return pub;
  },

  // Delete worker
  delete: async (id) => {
    try {
      const stmt = db.prepare('DELETE FROM workers WHERE id = $1');
      await stmt.run(id);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete worker: ${error.message}`);
    }
  },
};

module.exports = Worker;
