// Mock Worker Model - Phase 1 (no database yet)
// Will be replaced with real database queries in Phase 2 Part 3

const workers = {}; // In-memory storage
let nextWorkerId = 1;

const Worker = {
  // Create a new worker
  create: async (email, passwordHash, firstName, lastName, trade, city, hourlyRate, bio) => {
    const id = nextWorkerId++;
    const worker = {
      id,
      email,
      password_hash: passwordHash,
      first_name: firstName,
      last_name: lastName,
      trade,
      city,
      hourly_rate: hourlyRate,
      bio,
      created_at: new Date(),
      updated_at: new Date(),
    };
    workers[id] = worker;
    return worker;
  },

  // Find worker by email
  findByEmail: async (email) => {
    return Object.values(workers).find(w => w.email === email) || null;
  },

  // Find worker by ID
  findById: async (id) => {
    return workers[id] || null;
  },

  // Get all workers (for browsing)
  getAll: async () => {
    return Object.values(workers);
  },

  // Update worker
  update: async (id, updates) => {
    if (!workers[id]) return null;
    workers[id] = { ...workers[id], ...updates, updated_at: new Date() };
    return workers[id];
  },

  // Delete worker
  delete: async (id) => {
    delete workers[id];
    return true;
  },
};

module.exports = Worker;
