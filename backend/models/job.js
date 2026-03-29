// SQLite Job Model - Phase 2B

const db = require('../db/sqlite');

const Job = {
  // Create a new job
  create: async (employerId, title, description, tradeRequired, location, budget, urgency) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO employer_jobs (employer_id, title, description, trade_required, location, budget, urgency, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `);
      const result = stmt.run(employerId, title, description, tradeRequired, location, budget || 0, urgency || 'normal');
      return Job.findById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }
  },

  // Get job by ID
  findById: async (id) => {
    try {
      const stmt = db.prepare('SELECT * FROM employer_jobs WHERE id = ?');
      return stmt.get(id) || null;
    } catch (error) {
      throw new Error(`Failed to find job: ${error.message}`);
    }
  },

  // Get all active jobs
  getAll: async () => {
    try {
      const stmt = db.prepare('SELECT * FROM employer_jobs WHERE active = 1 ORDER BY created_at DESC');
      return stmt.all();
    } catch (error) {
      throw new Error(`Failed to get jobs: ${error.message}`);
    }
  },

  // Get jobs by trade (for notifications)
  getByTrade: async (trade) => {
    try {
      const stmt = db.prepare('SELECT * FROM employer_jobs WHERE active = 1 AND trade_required = ?');
      return stmt.all(trade);
    } catch (error) {
      throw new Error(`Failed to get jobs by trade: ${error.message}`);
    }
  },

  // Get jobs by location
  getByLocation: async (location) => {
    try {
      const stmt = db.prepare('SELECT * FROM employer_jobs WHERE active = 1 AND location = ?');
      return stmt.all(location);
    } catch (error) {
      throw new Error(`Failed to get jobs by location: ${error.message}`);
    }
  },

  // Update job
  update: async (id, updates) => {
    try {
      const allowedFields = ['title', 'description', 'budget', 'urgency', 'active'];
      const setClause = allowedFields
        .filter(field => field in updates)
        .map(field => `${field} = ?`)
        .join(', ');

      if (!setClause) return Job.findById(id);

      const values = allowedFields
        .filter(field => field in updates)
        .map(field => updates[field]);

      const stmt = db.prepare(`
        UPDATE employer_jobs 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(...values, id);
      return Job.findById(id);
    } catch (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }
  },

  // Delete job
  delete: async (id) => {
    try {
      const stmt = db.prepare('DELETE FROM employer_jobs WHERE id = ?');
      stmt.run(id);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete job: ${error.message}`);
    }
  },
};

module.exports = Job;
