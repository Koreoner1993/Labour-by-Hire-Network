// PostgreSQL Listing Model

const pool = require('../db/postgres');

// Helper: produce a $N placeholder
const p = n => ['$', n].join('');

const Listing = {
  // Create a new listing
  create: async (workerId, title, description, skills, availability) => {
    try {
      const skillsJson = JSON.stringify(skills || []);
      const { rows } = await pool.query(
        'INSERT INTO worker_listings (worker_id, title, description, skills, availability, active) ' +
        'VALUES (' + p(1) + ', ' + p(2) + ', ' + p(3) + ', ' + p(4) + ', ' + p(5) + ', TRUE) RETURNING *',
        [workerId, title, description, skillsJson, availability]
      );
      const listing = rows[0];
      if (listing && listing.skills) {
        listing.skills = JSON.parse(listing.skills);
      }
      return listing || null;
    } catch (error) {
      throw new Error('Failed to create listing: ' + error.message);
    }
  },

  // Get listing by ID
  findById: async (id) => {
    try {
      const { rows } = await pool.query('SELECT * FROM worker_listings WHERE id = ' + p(1), [id]);
      const listing = rows[0];
      if (listing && listing.skills) {
        listing.skills = JSON.parse(listing.skills);
      }
      return listing || null;
    } catch (error) {
      throw new Error('Failed to find listing: ' + error.message);
    }
  },

  // Get worker's listing
  getByWorkerId: async (workerId) => {
    try {
      const { rows } = await pool.query(
        'SELECT * FROM worker_listings WHERE worker_id = ' + p(1) + ' LIMIT 1',
        [workerId]
      );
      const listing = rows[0];
      if (listing && listing.skills) {
        listing.skills = JSON.parse(listing.skills);
      }
      return listing || null;
    } catch (error) {
      throw new Error('Failed to find listing: ' + error.message);
    }
  },

  // Get all active listings
  getAll: async () => {
    try {
      const { rows } = await pool.query('SELECT * FROM worker_listings WHERE active = TRUE ORDER BY created_at DESC');
      return rows.map(l => ({
        ...l,
        skills: l.skills ? JSON.parse(l.skills) : [],
      }));
    } catch (error) {
      throw new Error('Failed to get listings: ' + error.message);
    }
  },

  // Update listing
  update: async (id, updates) => {
    try {
      const allowedFields = ['title', 'description', 'availability', 'active'];
      const fields = allowedFields.filter(field => field in updates);

      if (!fields.length) return Listing.findById(id);

      const setClause = fields.map((field, i) => field + ' = ' + p(i + 1)).join(', ');
      const values = fields.map(field => {
        if (field === 'skills') return JSON.stringify(updates[field]);
        return updates[field];
      });

      const { rows } = await pool.query(
        'UPDATE worker_listings SET ' + setClause + ', updated_at = CURRENT_TIMESTAMP WHERE id = ' + p(fields.length + 1) + ' RETURNING *',
        [...values, id]
      );
      const listing = rows[0];
      if (listing && listing.skills) {
        listing.skills = JSON.parse(listing.skills);
      }
      return listing || null;
    } catch (error) {
      throw new Error('Failed to update listing: ' + error.message);
    }
  },

  // Delete listing
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM worker_listings WHERE id = ' + p(1), [id]);
      return true;
    } catch (error) {
      throw new Error('Failed to delete listing: ' + error.message);
    }
  },
};

module.exports = Listing;
