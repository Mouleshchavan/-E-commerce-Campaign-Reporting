const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db'); // Assuming db is for SQLite, or adjust as needed

// Define a helper function to handle error responses
const handleError = (res, statusCode, message) => {
  return res.status(statusCode).json({ errors: message });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return handleError(res, 400, 'Missing fields');
  }

  try {
    // Check if db exists, and use SQLite for database querying
    if (db) {
      db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
          return handleError(res, 500, 'Database error');
        }
        if (!user) {
          return handleError(res, 404, 'User not found');
        }

        // Compare password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return handleError(res, 401, 'Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET || 'default_secret');
        return res.json({ errors: '', data: { token } });
      });
    } else {
      // Fallback for in-memory user list (not recommended for production)
      const user = users.find((u) => u.username === username);
      if (!user) {
        return handleError(res, 404, 'User not found');
      }
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return handleError(res, 401, 'Invalid credentials');
      }

      const token = jwt.sign({ id: user.id, username }, process.env.JWT_SECRET || 'default_secret');
      return res.json({ errors: '', data: { token } });
    }
  } catch (error) {
    return handleError(res, 500, 'Internal server error');
  }
};

module.exports = { login };
