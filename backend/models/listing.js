// SQLite Listing Model - Phase 2B

const db = require('../db/sqlite');

const Listing = {
  // Create a new listing
  create: async (workerId, title, description, skills, availability) => {
    try {
      const skillsJson = JSON.stringify(skills || []);
      const stmt = db.prepare(`
        INSERT INTO worker_listings (worker_id, title, description, skills, availability, active)
        VALUES ($1, $2, $3, $4, $5, true)
        RETURNING id
      `);
      const result = await stmt.run(workerId, title, description, skillsJson, availability);
      return Listing.findById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create listing: ${error.message}`);
    }
  },

  // Get listing by ID
  findById: async (id) => {
    try {
      const stmt = db.prepare('SELECT * FROM worker_listings WHERE id = $1');
      const listing = await stmt.get(id);
      if (listing && listing.skills) {
        listing.skills = JSON.parse(listing.skills);
      }
      return listing || null;
    } catch (error) {
      throw new Error(`Failed to find listing: ${error.message}`);
    }
  },

  // Get worker's listing
  getByWorkerId: async (workerId) => {
    try {
      const stmt = db.prepare('SELECT * FROM worker_listings WHERE worker_id = $1 LIMIT 1');
      const listing = await stmt.get(workerId);
      if (listing && listing.skills) {
        listing.skills = JSON.parse(listing.skills);
      }
      return listing || null;
    } catch (error) {
      throw new Error(`Failed to find listing: ${error.message}`);
    }
  },

  // Get all active listings
  getAll: async () => {
    try {
      const stmt = db.prepare('SELECT * FROM worker_listings WHERE active = true ORDER BY created_at DESC');
      const listings = await stmt.all();
      return listings.map(l => ({
        ...l,
        skills: l.skills ? JSON.parse(l.skills) : []
      }));
    } catch (error) {
      throw new Error(`Failed to get listings: ${error.message}`);
    }
  },

  // Update listing
  update: async (id, updates) => {
    try {
      const allowedFields = ['title', 'description', 'availability', 'active'];
      const setClause = allowedFields
        .filter(field => field in updates)
        .map((field, idx) => `${field} = $${idx + 1}`)
        .join(', ');

      if (!setClause) return Listing.findById(id);

      let values = allowedFields
        .filter(field => field in updates)
        .map(field => {
          if (field === 'skills') return JSON.stringify(updates[field]);
          return updates[field];
        });

      const stmt = db.prepare(`
        UPDATE worker_listings
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${values.length + 1}
      `);
      await stmt.run(...values, id);
      return Listing.findById(id);
    } catch (error) {
      throw new Error(`Failed to update listing: ${error.message}`);
    }
  },

  // Delete listing
  delete: async (id) => {
    try {
      const stmt = db.prepare('DELETE FROM worker_listings WHERE id = $1');
      await stmt.run(id);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete listing: ${error.message}`);
    }
  },
};

module.exports = Listing;
