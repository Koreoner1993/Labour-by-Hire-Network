-- Labour by Hire Database Schema
-- Phase 1: Workers, Listings, Jobs, Notifications

-- Workers table
CREATE TABLE IF NOT EXISTS workers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  trade VARCHAR(100) NOT NULL,
  city VARCHAR(100),
  hourly_rate DECIMAL(10, 2),
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Worker Listings table
CREATE TABLE IF NOT EXISTS worker_listings (
  id SERIAL PRIMARY KEY,
  worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  skills TEXT[],
  availability VARCHAR(50),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employer Jobs table
CREATE TABLE IF NOT EXISTS employer_jobs (
  id SERIAL PRIMARY KEY,
  employer_id VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  trade_required VARCHAR(100),
  location VARCHAR(100),
  budget DECIMAL(10, 2),
  urgency VARCHAR(50) DEFAULT 'normal',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  worker_id INTEGER NOT NULL REFERENCES workers(id) ON DELETE CASCADE,
  job_id INTEGER NOT NULL REFERENCES employer_jobs(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'job_match',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX idx_workers_email ON workers(email);
CREATE INDEX idx_worker_listings_worker_id ON worker_listings(worker_id);
CREATE INDEX idx_worker_listings_active ON worker_listings(active);
CREATE INDEX idx_employer_jobs_trade ON employer_jobs(trade_required);
CREATE INDEX idx_employer_jobs_location ON employer_jobs(location);
CREATE INDEX idx_employer_jobs_urgency ON employer_jobs(urgency);
CREATE INDEX idx_notifications_worker_id ON notifications(worker_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
