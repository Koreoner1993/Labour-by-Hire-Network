const db = require('../db/sqlite');

const Equipment = {
  // Create a new equipment listing
  create: async (ownerId, title, category, description, dailyRate, location, condition, availability) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO equipment_listings (owner_id, title, category, description, daily_rate, location, condition, availability, active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `);
      const result = stmt.run(ownerId, title, category, description || null, dailyRate, location || null, condition || 'Good', availability || 'Available');
      return Equipment.findById(result.lastInsertRowid);
    } catch (error) {
      throw new Error(`Failed to create equipment listing: ${error.message}`);
    }
  },

  // Get equipment listing by ID (enriched with owner info)
  findById: async (id) => {
    try {
      const stmt = db.prepare(`
        SELECT e.*, w.first_name, w.last_name, w.trade, w.city as owner_city
        FROM equipment_listings e
        JOIN workers w ON e.owner_id = w.id
        WHERE e.id = ?
      `);
      const item = stmt.get(id);
      if (!item) return null;
      return Equipment._format(item);
    } catch (error) {
      throw new Error(`Failed to find equipment listing: ${error.message}`);
    }
  },

  // Get all listings for a specific owner
  getByOwnerId: async (ownerId) => {
    try {
      const stmt = db.prepare(`
        SELECT e.*, w.first_name, w.last_name, w.trade, w.city as owner_city
        FROM equipment_listings e
        JOIN workers w ON e.owner_id = w.id
        WHERE e.owner_id = ?
        ORDER BY e.created_at DESC
      `);
      return stmt.all(ownerId).map(Equipment._format);
    } catch (error) {
      throw new Error(`Failed to get equipment listings: ${error.message}`);
    }
  },

  // Get all active listings with optional filters
  getAll: async ({ category, location, maxRate } = {}) => {
    try {
      let query = `
        SELECT e.*, w.first_name, w.last_name, w.trade, w.city as owner_city
        FROM equipment_listings e
        JOIN workers w ON e.owner_id = w.id
        WHERE e.active = 1
      `;
      const params = [];

      if (category && category !== 'All') {
        query += ' AND e.category = ?';
        params.push(category);
      }
      if (location) {
        query += ' AND (e.location LIKE ? OR w.city LIKE ?)';
        params.push(`%${location}%`, `%${location}%`);
      }
      if (maxRate) {
        query += ' AND e.daily_rate <= ?';
        params.push(parseFloat(maxRate));
      }

      query += ' ORDER BY e.created_at DESC';

      const stmt = db.prepare(query);
      return stmt.all(...params).map(Equipment._format);
    } catch (error) {
      throw new Error(`Failed to get equipment listings: ${error.message}`);
    }
  },

  // Update an equipment listing
  update: async (id, updates) => {
    try {
      const allowedFields = ['title', 'category', 'description', 'daily_rate', 'location', 'condition', 'availability', 'active'];
      const fields = allowedFields.filter(f => f in updates);
      if (!fields.length) return Equipment.findById(id);

      const setClause = fields.map(f => `${f} = ?`).join(', ');
      const values = fields.map(f => updates[f]);

      const stmt = db.prepare(`
        UPDATE equipment_listings
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      stmt.run(...values, id);
      return Equipment.findById(id);
    } catch (error) {
      throw new Error(`Failed to update equipment listing: ${error.message}`);
    }
  },

  // Delete an equipment listing
  delete: async (id) => {
    try {
      db.prepare('DELETE FROM equipment_listings WHERE id = ?').run(id);
      return true;
    } catch (error) {
      throw new Error(`Failed to delete equipment listing: ${error.message}`);
    }
  },

  // Format a raw DB row into a clean response object
  _format: (row) => ({
    id: row.id,
    owner_id: row.owner_id,
    title: row.title,
    category: row.category,
    description: row.description,
    daily_rate: row.daily_rate,
    location: row.location,
    condition: row.condition,
    availability: row.availability,
    active: row.active,
    created_at: row.created_at,
    updated_at: row.updated_at,
    owner: {
      id: row.owner_id,
      name: `${row.first_name} ${row.last_name}`,
      trade: row.trade,
      city: row.owner_city,
    },
  }),
};

module.exports = Equipment;
