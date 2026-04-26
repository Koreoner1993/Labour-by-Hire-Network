// PostgreSQL Equipment Model

const pool = require('../db/postgres');

// Helper: produce a $N placeholder
const p = n => ['$', n].join('');

const Equipment = {
  // Create a new equipment listing
  create: async (ownerId, title, category, description, dailyRate, location, condition, availability) => {
    try {
      const { rows } = await pool.query(
        'INSERT INTO equipment_listings (owner_id, title, category, description, daily_rate, location, condition, availability, active) ' +
        'VALUES (' + p(1) + ', ' + p(2) + ', ' + p(3) + ', ' + p(4) + ', ' + p(5) + ', ' + p(6) + ', ' + p(7) + ', ' + p(8) + ', TRUE) RETURNING *',
        [ownerId, title, category, description || null, dailyRate, location || null, condition || 'Good', availability || 'Available']
      );
      const item = rows[0];
      if (!item) return null;
      // Fetch with owner info
      return Equipment.findById(item.id);
    } catch (error) {
      throw new Error('Failed to create equipment listing: ' + error.message);
    }
  },

  // Get equipment listing by ID (enriched with owner info)
  findById: async (id) => {
    try {
      const { rows } = await pool.query(
        'SELECT e.*, w.first_name, w.last_name, w.trade, w.city as owner_city ' +
        'FROM equipment_listings e ' +
        'JOIN workers w ON e.owner_id = w.id ' +
        'WHERE e.id = ' + p(1),
        [id]
      );
      const item = rows[0];
      if (!item) return null;
      return Equipment._format(item);
    } catch (error) {
      throw new Error('Failed to find equipment listing: ' + error.message);
    }
  },

  // Get all listings for a specific owner
  getByOwnerId: async (ownerId) => {
    try {
      const { rows } = await pool.query(
        'SELECT e.*, w.first_name, w.last_name, w.trade, w.city as owner_city ' +
        'FROM equipment_listings e ' +
        'JOIN workers w ON e.owner_id = w.id ' +
        'WHERE e.owner_id = ' + p(1) + ' ORDER BY e.created_at DESC',
        [ownerId]
      );
      return rows.map(Equipment._format);
    } catch (error) {
      throw new Error('Failed to get equipment listings: ' + error.message);
    }
  },

  // Get all active listings with optional filters
  getAll: async ({ category, location, maxRate } = {}) => {
    try {
      let query =
        'SELECT e.*, w.first_name, w.last_name, w.trade, w.city as owner_city ' +
        'FROM equipment_listings e ' +
        'JOIN workers w ON e.owner_id = w.id ' +
        'WHERE e.active = TRUE';
      const params = [];
      let paramIndex = 1;

      if (category && category !== 'All') {
        params.push(category);
        query += ' AND e.category = ' + p(params.length);
      }
      if (location) {
        params.push('%' + location + '%');
        query += ' AND (e.location ILIKE ' + p(params.length);
        params.push('%' + location + '%');
        query += ' OR w.city ILIKE ' + p(params.length) + ')';
      }
      if (maxRate) {
        params.push(parseFloat(maxRate));
        query += ' AND e.daily_rate <= ' + p(params.length);
      }

      query += ' ORDER BY e.created_at DESC';

      const { rows } = await pool.query(query, params);
      return rows.map(Equipment._format);
    } catch (error) {
      throw new Error('Failed to get equipment listings: ' + error.message);
    }
  },

  // Update an equipment listing
  update: async (id, updates) => {
    try {
      const allowedFields = ['title', 'category', 'description', 'daily_rate', 'location', 'condition', 'availability', 'active'];
      const fields = allowedFields.filter(f => f in updates);
      if (!fields.length) return Equipment.findById(id);

      const setClause = fields.map((f, i) => f + ' = ' + p(i + 1)).join(', ');
      const values = fields.map(f => updates[f]);

      await pool.query(
        'UPDATE equipment_listings SET ' + setClause + ', updated_at = CURRENT_TIMESTAMP WHERE id = ' + p(fields.length + 1),
        [...values, id]
      );
      return Equipment.findById(id);
    } catch (error) {
      throw new Error('Failed to update equipment listing: ' + error.message);
    }
  },

  // Delete an equipment listing
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM equipment_listings WHERE id = ' + p(1), [id]);
      return true;
    } catch (error) {
      throw new Error('Failed to delete equipment listing: ' + error.message);
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
      name: row.first_name + ' ' + row.last_name,
      trade: row.trade,
      city: row.owner_city,
    },
  }),
};

module.exports = Equipment;
