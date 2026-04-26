const pool = require('./db');

// Initialize database schema
async function initializeSchema() {
  const schemaSQL = `
    CREATE TABLE IF NOT EXISTS workers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      trade TEXT NOT NULL,
      city TEXT,
      hourly_rate NUMERIC,
      bio TEXT,
      licence_number TEXT,
      white_card TEXT,
      wallet_address TEXT,
      labour_score INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS worker_listings (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL,
      title TEXT,
      description TEXT,
      skills TEXT,
      availability TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS employer_jobs (
      id SERIAL PRIMARY KEY,
      employer_id TEXT,
      title TEXT NOT NULL,
      description TEXT,
      trade_required TEXT,
      location TEXT,
      budget NUMERIC,
      urgency TEXT DEFAULT 'normal',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL,
      job_id INTEGER NOT NULL,
      type TEXT DEFAULT 'job_match',
      is_read BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
      FOREIGN KEY (job_id) REFERENCES employer_jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS equipment_listings (
      id SERIAL PRIMARY KEY,
      owner_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      daily_rate NUMERIC NOT NULL,
      location TEXT,
      condition TEXT DEFAULT 'Good',
      availability TEXT DEFAULT 'Available',
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES workers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      worker_id INTEGER NOT NULL,
      from_name TEXT NOT NULL,
      from_email TEXT NOT NULL,
      company TEXT,
      body TEXT NOT NULL,
      read INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS waitlist (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      source TEXT DEFAULT 'spotlight',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
    CREATE INDEX IF NOT EXISTS idx_worker_listings_worker_id ON worker_listings(worker_id);
    CREATE INDEX IF NOT EXISTS idx_worker_listings_active ON worker_listings(active);
    CREATE INDEX IF NOT EXISTS idx_employer_jobs_trade ON employer_jobs(trade_required);
    CREATE INDEX IF NOT EXISTS idx_employer_jobs_location ON employer_jobs(location);
    CREATE INDEX IF NOT EXISTS idx_employer_jobs_urgency ON employer_jobs(urgency);
    CREATE INDEX IF NOT EXISTS idx_notifications_worker_id ON notifications(worker_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
    CREATE INDEX IF NOT EXISTS idx_equipment_owner ON equipment_listings(owner_id);
    CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment_listings(category);
    CREATE INDEX IF NOT EXISTS idx_equipment_active ON equipment_listings(active);
    CREATE INDEX IF NOT EXISTS idx_messages_worker_id ON messages(worker_id);
    CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
    CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
  `;

  try {
    await pool.query(schemaSQL);
    console.log('Database schema initialized successfully');
  } catch (error) {
    if (!error.message.includes('already exists')) {
      console.error('Error initializing schema:', error);
    }
  }
}

// Initialize schema on module load
initializeSchema().catch(console.error);

// Wrapper for prepared statements to maintain API compatibility
class Statement {
  constructor(sql) {
    this.sql = sql;
  }

  async run(...params) {
    try {
      const result = await pool.query(this.sql, params);
      return {
        lastInsertRowid: result.rows[0]?.id || null,
        changes: result.rowCount,
      };
    } catch (error) {
      throw error;
    }
  }

  async get(...params) {
    try {
      const result = await pool.query(this.sql, params);
      return result.rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async all(...params) {
    try {
      const result = await pool.query(this.sql, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

// Wrapper to maintain compatibility with better-sqlite3 API
const db = {
  prepare: (sql) => new Statement(sql),

  async exec(sql) {
    try {
      await pool.query(sql);
    } catch (error) {
      if (!error.message.includes('already exists')) {
        throw error;
      }
    }
  },

  pragma: () => {
    // PostgreSQL handles foreign keys by default
  },
};

module.exports = db;
