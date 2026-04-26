// PostgreSQL Job Model

const pool = require('../db/postgres');

// Helper: produce a $N placeholder
const p = n => ['$', n].join('');

const Job = {
  // Create a new job
  create: async (employerId, title, description, tradeRequired, location, budget, urgency) => {
    try {
      const { rows } = await pool.query(
        'INSERT INTO employer_jobs (employer_id, title, description, trade_required, location, budget, urgency, active) ' +
        'VALUES (' + p(1) + ', ' + p(2) + ', ' + p(3) + ', ' + p(4) + ', ' + p(5) + ', ' + p(6) + ', ' + p(7) + ', TRUE) RETURNING *',
        [employerId, title, description, tradeRequired, location, budget || 0, urgency || 'normal']
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to create job: ' + error.message);
    }
  },

  // Get job by ID
  findById: async (id) => {
    try {
      const { rows } = await pool.query('SELECT * FROM employer_jobs WHERE id = ' + p(1), [id]);
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to find job: ' + error.message);
    }
  },

  // Get all active jobs
  getAll: async () => {
    try {
      const { rows } = await pool.query('SELECT * FROM employer_jobs WHERE active = TRUE ORDER BY created_at DESC');
      return rows;
    } catch (error) {
      throw new Error('Failed to get jobs: ' + error.message);
    }
  },

  // Get jobs by trade (for notifications)
  getByTrade: async (trade) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM employer_jobs WHERE active = TRUE AND trade_required = ' + p(1),
        [trade]
      );
      return rows;
    } catch (error) {
      throw new Error('Failed to get jobs by trade: ' + error.message);
    }
  },

  // Get jobs by location
  getByLocation: async (location) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM employer_jobs WHERE active = TRUE AND location = ' + p(1),
        [location]
      );
      return rows;
    } catch (error) {
      throw new Error('Failed to get jobs by location: ' + error.message);
    }
  },

  // Update job
  update: async (id, updates) => {
    try {
      const allowedFields = ['title', 'description', 'budget', 'urgency', 'active'];
      const fields = allowedFields.filter(field => field in updates);

      if (!fields.length) return Job.findById(id);

      const setClause = fields.map((field, i) => field + ' = ' + p(i + 1)).join(', ');
      const values = fields.map(field => updates[field]);

      const { rows } = await pool.query(
        'UPDATE employer_jobs SET ' + setClause + ', updated_at = CURRENT_TIMESTAMP WHERE id = ' + p(fields.length + 1) + ' RETURNING *',
        [...values, id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error('Failed to update job: ' + error.message);
    }
  },

  // Delete job
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM employer_jobs WHERE id = ' + p(1), [id]);
      return true;
    } catch (error) {
      throw new Error('Failed to delete job: ' + error.message);
    }
  },
};

module.exports = Job;
