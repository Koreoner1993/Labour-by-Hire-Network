const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate JWT token
const generateToken = (workerId, email) => {
  return jwt.sign(
    { id: workerId, email },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
    { expiresIn: process.env.JWT_EXPIRY || '7d' }
  );
};

// Verify JWT token
const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
  } catch (error) {
    return null;
  }
};

// Hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
};

// Compare passwords
const comparePasswords = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

// Standardized error response
const errorResponse = (message, status = 500) => {
  return { error: message, status };
};

// Standardized success response
const successResponse = (data, message = 'Success') => {
  return { data, message, status: 200 };
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePasswords,
  errorResponse,
  successResponse,
};
