const { Pool } = require('pg');

// Build connection config from environment variables.
// Railway injects DATABASE_URL automatically when a Postgres service is linked.
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST || 'localhost',
        port: parseInt(process.env.PGPORT || '5432', 10),
        user: process.env.PGUSER || 'postgres',
        password: process.env.PGPASSWORD || '',
        database: process.env.PGDATABASE || 'labour_by_hire',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      }
);

// Create all tables on startup (idempotent)
async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS workers (
        id              SERIAL PRIMARY KEY,
        email           TEXT UNIQUE NOT NULL,
        password_hash   TEXT NOT NULL,
        first_name      TEXT,
        last_name       TEXT,
        trade           TEXT NOT NULL,
        city            TEXT,
        hourly_rate     REAL,
        bio             TEXT,
        licence_number  TEXT,
        white_card      TEXT,
        wallet_address  TEXT,
        labour_score    INTEGER DEFAULT 0,
        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS worker_listings (
        id           SERIAL PRIMARY KEY,
        worker_id    INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        title        TEXT,
        description  TEXT,
        skills       TEXT,
        availability TEXT,
        active       BOOLEAN DEFAULT TRUE,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS employer_jobs (
        id             SERIAL PRIMARY KEY,
        employer_id    TEXT,
        title          TEXT NOT NULL,
        description    TEXT,
        trade_required TEXT,
        location       TEXT,
        budget         REAL,
        urgency        TEXT DEFAULT 'normal',
        active         BOOLEAN DEFAULT TRUE,
        created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id         SERIAL PRIMARY KEY,
        worker_id  INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        job_id     INTEGER NOT NULL REFERENCES employer_jobs(id) ON DELETE CASCADE,
        type       TEXT DEFAULT 'job_match',
        is_read    BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS equipment_listings (
        id           SERIAL PRIMARY KEY,
        owner_id     INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        title        TEXT NOT NULL,
        category     TEXT NOT NULL,
        description  TEXT,
        daily_rate   REAL NOT NULL,
        location     TEXT,
        condition    TEXT DEFAULT 'Good',
        availability TEXT DEFAULT 'Available',
        active       BOOLEAN DEFAULT TRUE,
        created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id         SERIAL PRIMARY KEY,
        worker_id  INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
        from_name  TEXT NOT NULL,
        from_email TEXT NOT NULL,
        company    TEXT,
        body       TEXT NOT NULL,
        read       INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS waitlist (
        id         SERIAL PRIMARY KEY,
        email      TEXT UNIQUE NOT NULL,
        source     TEXT DEFAULT 'spotlight',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Indexes (CREATE INDEX IF NOT EXISTS is safe to run repeatedly)
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_workers_email              ON workers(email);
      CREATE INDEX IF NOT EXISTS idx_worker_listings_worker_id  ON worker_listings(worker_id);
      CREATE INDEX IF NOT EXISTS idx_worker_listings_active      ON worker_listings(active);
      CREATE INDEX IF NOT EXISTS idx_employer_jobs_trade         ON employer_jobs(trade_required);
      CREATE INDEX IF NOT EXISTS idx_employer_jobs_location      ON employer_jobs(location);
      CREATE INDEX IF NOT EXISTS idx_employer_jobs_urgency       ON employer_jobs(urgency);
      CREATE INDEX IF NOT EXISTS idx_notifications_worker_id     ON notifications(worker_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_is_read       ON notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_equipment_owner             ON equipment_listings(owner_id);
      CREATE INDEX IF NOT EXISTS idx_equipment_category          ON equipment_listings(category);
      CREATE INDEX IF NOT EXISTS idx_equipment_active            ON equipment_listings(active);
      CREATE INDEX IF NOT EXISTS idx_messages_worker_id          ON messages(worker_id);
      CREATE INDEX IF NOT EXISTS idx_messages_read               ON messages(read);
      CREATE INDEX IF NOT EXISTS idx_waitlist_email              ON waitlist(email);
    `);

    console.log('✅ PostgreSQL tables initialised');
  } finally {
    client.release();
  }
}

// Run schema init immediately; log errors but don't crash the process so that
// the health-check endpoint can still respond while the DB is warming up.
initDb().catch(err => console.error('❌ DB init error:', err.message));

module.exports = pool;
