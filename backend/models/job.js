// Mock Job Model - Phase 1 (no database yet)
// Will be replaced with real database queries in Phase 2 Part 3

const jobs = {}; // In-memory storage
let nextJobId = 1;

const Job = {
  // Create a new job
  create: async (employerId, title, description, tradeRequired, location, budget, urgency) => {
    const id = nextJobId++;
    const job = {
      id,
      employer_id: employerId,
      title,
      description,
      trade_required: tradeRequired,
      location,
      budget,
      urgency: urgency || 'normal',
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    jobs[id] = job;
    return job;
  },

  // Get job by ID
  findById: async (id) => {
    return jobs[id] || null;
  },

  // Get all active jobs
  getAll: async () => {
    return Object.values(jobs).filter(j => j.active);
  },

  // Get jobs by trade (for notifications)
  getByTrade: async (trade) => {
    return Object.values(jobs).filter(j => j.active && j.trade_required === trade);
  },

  // Get jobs by location
  getByLocation: async (location) => {
    return Object.values(jobs).filter(j => j.active && j.location === location);
  },

  // Update job
  update: async (id, updates) => {
    if (!jobs[id]) return null;
    jobs[id] = { ...jobs[id], ...updates, updated_at: new Date() };
    return jobs[id];
  },

  // Delete job
  delete: async (id) => {
    delete jobs[id];
    return true;
  },
};

module.exports = Job;
