// PostgreSQL Worker Model

const pool = require('../db/postgres');

// Helper: produce a $N placeholder without triggering tool interpolation
const p = n => ['$', n].join('');

const Worker = {
  // Create a new worker
  create: async (email, passwordHash, firstName, lastName, trade, city, hourlyRate, bio, licenceNumber, whiteCard, walletAddress) => {
    try {
      const { rows } = await pool.query(
        'INSERT INTO workers (email, password_hash, first_name, last_name, trade, city, hourly_rate, bio, licence_number, white_card, wallet_address) ' +
        'VALUES (' + p(1) + ', ' + p(2) + ', ' + p(3) + ', ' + p(4) + ', ' + p(5) + ', ' + p(6) + ', ' + p(7) + ', ' + p(8) + ', ' + p(9) + ', ' + p(10) + ', ' + p(11) + ') RETURNING *',
        [email, passwordHash, firstName, lastName, trade, city, hourlyRate || 0, bio, licenceNumber || null, whiteCard || null, walletAddress || null]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to create worker: ' + error.message);
    }
  },

  // Find worker by email
  findByEmail: async (email) => {
    try {
      const { rows } = await pool.query('SELECT * FROM workers WHERE email = ' + p(1), [email]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to find worker: ' + error.message);
    }
  },

  // Find worker by ID
  findById: async (id) => {
    try {
      const { rows } = await pool.query('SELECT * FROM workers WHERE id = ' + p(1), [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to find worker: ' + error.message);
    }
  },

  // Get all workers (for browsing)
  getAll: async () => {
    try {
      const { rows } = await pool.query('SELECT * FROM workers ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw new Error('Failed to get workers: ' + error.message);
    }
  },

  // Update worker
  update: async (id, updates) => {
    try {
      const allowedFields = ['first_name', 'last_name', 'city', 'hourly_rate', 'bio', 'licence_number', 'white_card'];
      const fields = allowedFields.filter(field => field in updates);

      if (!fields.length) return Worker.findById(id);

      const setClause = fields.map((field, i) => field + ' = ' + p(i + 1)).join(', ');
      const values = fields.map(field => updates[field]);

      const { rows } = await pool.query(
        'UPDATE workers SET ' + setClause + ', updated_at = CURRENT_TIMESTAMP WHERE id = ' + p(fields.length + 1) + ' RETURNING *',
        [...values, id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to update worker: ' + error.message);
    }
  },

  // Update labour_score
  updateScore: async (id, score) => {
    try {
      await pool.query(
        'UPDATE workers SET labour_score = ' + p(1) + ', updated_at = CURRENT_TIMESTAMP WHERE id = ' + p(2),
        [score, id]
      );
    } catch (error) {
      throw new Error('Failed to update score: ' + error.message);
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
      await pool.query('DELETE FROM workers WHERE id = ' + p(1), [id]);
      return true;
    } catch (error) {
      throw new Error('Failed to delete worker: ' + error.message);
    }
  },
};

module.exports = Worker;
