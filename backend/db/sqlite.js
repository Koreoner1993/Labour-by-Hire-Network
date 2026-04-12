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
    licence_number TEXT,
    white_card TEXT,
    wallet_address TEXT,
    labour_score INTEGER DEFAULT 0,
    verification_hash TEXT,
    hedera_token_id TEXT,
    hedera_serial INTEGER,
    hedera_tx_id TEXT,
    badge_metadata_uri TEXT,
    badge_svg_uri TEXT,
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

  CREATE TABLE IF NOT EXISTS equipment_listings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    owner_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    daily_rate REAL NOT NULL,
    location TEXT,
    condition TEXT DEFAULT 'Good',
    availability TEXT DEFAULT 'Available',
    active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES workers(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_equipment_owner ON equipment_listings(owner_id);
  CREATE INDEX IF NOT EXISTS idx_equipment_category ON equipment_listings(category);
  CREATE INDEX IF NOT EXISTS idx_equipment_active ON equipment_listings(active);

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    worker_id INTEGER NOT NULL,
    from_name TEXT NOT NULL,
    from_email TEXT NOT NULL,
    company TEXT,
    body TEXT NOT NULL,
    read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (worker_id) REFERENCES workers(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS idx_messages_worker_id ON messages(worker_id);
  CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);
`);

// Migrate existing databases: add new columns if they don't exist yet.
// SQLite does not support IF NOT EXISTS for ALTER TABLE columns, so we catch errors.
const newWorkerColumns = [
  "ALTER TABLE workers ADD COLUMN licence_number TEXT",
  "ALTER TABLE workers ADD COLUMN white_card TEXT",
  "ALTER TABLE workers ADD COLUMN wallet_address TEXT",
  "ALTER TABLE workers ADD COLUMN labour_score INTEGER DEFAULT 0",
  "ALTER TABLE workers ADD COLUMN verification_hash TEXT",
  "ALTER TABLE workers ADD COLUMN hedera_token_id TEXT",
  "ALTER TABLE workers ADD COLUMN hedera_serial INTEGER",
  "ALTER TABLE workers ADD COLUMN hedera_tx_id TEXT",
  "ALTER TABLE workers ADD COLUMN badge_metadata_uri TEXT",
  "ALTER TABLE workers ADD COLUMN badge_svg_uri TEXT",
];
for (const sql of newWorkerColumns) {
  try { db.exec(sql); } catch (_) { /* column already exists */ }
}

module.exports = db;
