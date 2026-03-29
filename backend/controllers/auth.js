const Worker = require('../models/worker');
const { hashPassword, comparePasswords, generateToken, errorResponse, successResponse } = require('../utils/helpers');

// Register a new worker
const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, trade, city, hourlyRate } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName || !trade) {
      return res.status(400).json({ error: 'Missing required fields', code: 'MISSING_FIELDS' });
    }

    // Check if worker already exists
    const existing = await Worker.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered', code: 'EMAIL_EXISTS' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create worker
    const worker = await Worker.create(
      email,
      passwordHash,
      firstName,
      lastName,
      trade,
      city,
      hourlyRate || 0,
      null
    );

    // Generate token
    const token = generateToken(worker.id, worker.email);

    // Return worker (without password hash)
    const { password_hash, ...workerData } = worker;
    res.status(201).json({
      message: 'Worker registered successfully',
      token,
      worker: workerData,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required', code: 'MISSING_FIELDS' });
    }

    // Find worker
    const worker = await Worker.findByEmail(email);
    if (!worker) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    // Compare passwords
    const passwordValid = await comparePasswords(password, worker.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' });
    }

    // Generate token
    const token = generateToken(worker.id, worker.email);

    // Return worker (without password hash)
    const { password_hash, ...workerData } = worker;
    res.json({
      message: 'Login successful',
      token,
      worker: workerData,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
};

module.exports = {
  register,
  login,
};
