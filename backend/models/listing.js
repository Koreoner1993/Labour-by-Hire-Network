// Mock Listing Model - Phase 1 (no database yet)
// Will be replaced with real database queries in Phase 2 Part 3

const listings = {}; // In-memory storage
let nextListingId = 1;

const Listing = {
  // Create a new listing
  create: async (workerId, title, description, skills, availability) => {
    const id = nextListingId++;
    const listing = {
      id,
      worker_id: workerId,
      title,
      description,
      skills: skills || [],
      availability,
      active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };
    listings[id] = listing;
    return listing;
  },

  // Get listing by ID
  findById: async (id) => {
    return listings[id] || null;
  },

  // Get worker's listing
  getByWorkerId: async (workerId) => {
    return Object.values(listings).find(l => l.worker_id === workerId) || null;
  },

  // Get all active listings
  getAll: async () => {
    return Object.values(listings).filter(l => l.active);
  },

  // Update listing
  update: async (id, updates) => {
    if (!listings[id]) return null;
    listings[id] = { ...listings[id], ...updates, updated_at: new Date() };
    return listings[id];
  },

  // Delete listing
  delete: async (id) => {
    delete listings[id];
    return true;
  },
};

module.exports = Listing;
