const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'labour_by_hire.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS workers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    trade TEXT NOT NULL,
    city TEXT,
    hourly_rate REAL,
    bio TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS worker_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    title TEXT,
    description TEXT,
    skills TEXT,
    availability TEXT,
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS employer_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    employer_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    trade_required TEXT,
    location TEXT,
    budget REAL,
    urgency TEXT DEFAULT 'normal',
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    type TEXT DEFAULT 'job_match',
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES employer_jobs(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
  CREATE INDEX IF NOT EXISTS idx_worker_listings_worker_id ON worker_listings(worker_id);
  CREATE INDEX IF NOT EXISTS idx_worker_listings_active ON worker_listings(active);
  CREATE INDEX IF NOT EXISTS idx_employer_jobs_trade ON employer_jobs(trade_required);
  CREATE INDEX IF NOT EXISTS idx_employer_jobs_location ON employer_jobs(location);
  CREATE INDEX IF NOT EXISTS idx_employer_jobs_urgency ON employer_jobs(urgency);
  CREATE INDEX IF NOT EXISTS idx_notifications_worker_id ON notifications(worker_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
`);

module.exports = db;
