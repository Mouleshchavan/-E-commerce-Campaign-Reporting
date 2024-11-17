const bcrypt = require('bcrypt');
// Assuming 'db' is either a SQLite or similar DB setup. If not, fallback to array
const db = require('../models/db') || null; // Ensure db is properly imported, or null if not available

// Temporary in-memory storage for users if the database is unavailable
let users = [];

const createUser = async (req, res) => {
  const { username, password, email } = req.body;

  // Validate required fields
  if (!username || !password || !email) {
    return res.status(400).json({ errors: "Missing fields" });
  }

  try {
    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (db) {
      // Check if username already exists in the database
      db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) {
          return res.status(400).json({ errors: "Error checking username: " + err.message });
        }

        if (row) {
          return res.status(400).json({ errors: "Username already exists" });
        }

        // Insert the user if the username is unique
        db.run(
          `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
          [username, hashedPassword, email],
          function (err) {
            if (err) {
              return res.status(400).json({ errors: "Error inserting user: " + err.message });
            }
            // Respond with the newly created user's details
            res.json({ errors: "", data: { id: this.lastID, username, email } });
          }
        );
      });
    } else {
      // Fallback to in-memory array if no db
      const existingUser = users.find(user => user.username === username);
      if (existingUser) {
        return res.status(400).json({ errors: "Username already exists" });
      }

      // Add the new user to the temporary array
      const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword,
        email,
      };
      users.push(newUser);

      // Respond with the newly created user's details
      res.json({ errors: "", data: newUser });
    }
  } catch (err) {
    res.status(500).json({ errors: "Internal server error: " + err.message });
  }
};

const getUsers = (req, res) => {
  const { id } = req.params;

  if (db) {
    if (id) {
      db.get(`SELECT id, username, email FROM users WHERE id = ?`, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ errors: "Error retrieving user: " + err.message });
        }
        if (!row) {
          return res.status(404).json({ errors: "User not found" });
        }
        res.json({ errors: "", data: row });
      });
    } else {
      db.all(`SELECT id, username, email FROM users`, [], (err, rows) => {
        if (err) {
          return res.status(500).json({ errors: "Error retrieving users: " + err.message });
        }
        res.json({ errors: "", data: rows });
      });
    }
  } else {
    // Fallback to in-memory storage
    if (id) {
      const user = users.find(user => user.id === parseInt(id));
      if (!user) {
        return res.status(404).json({ errors: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json({ errors: "", data: userWithoutPassword });
    } else {
      const usersWithoutPasswords = users.map(({ password, ...rest }) => rest);
      res.json({ errors: "", data: usersWithoutPasswords });
    }
  }
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const { username, email } = req.body;

  if (!username && !email) {
    return res.status(400).json({ errors: "Nothing to update" });
  }

  if (db) {
    db.get(`SELECT * FROM users WHERE id = ?`, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ errors: "Error retrieving user: " + err.message });
      }
      if (!row) {
        return res.status(404).json({ errors: "User not found" });
      }

      db.run(
        `UPDATE users SET username = ?, email = ? WHERE id = ?`,
        [username || row.username, email || row.email, id],
        function (err) {
          if (err) {
            return res.status(500).json({ errors: "Error updating user: " + err.message });
          }
          res.json({ errors: "", data: { id, username: username || row.username, email: email || row.email } });
        }
      );
    });
  } else {
    // Fallback to in-memory storage
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({ errors: "User not found" });
    }

    const updatedUser = {
      ...users[userIndex],
      username: username || users[userIndex].username,
      email: email || users[userIndex].email,
    };
    users[userIndex] = updatedUser;

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ errors: "", data: userWithoutPassword });
  }
};

const deleteUser = (req, res) => {
  const { id } = req.params;

  if (db) {
    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
      if (err) {
        return res.status(500).json({ errors: "Error deleting user: " + err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ errors: "User not found" });
      }
      res.json({ errors: "", data: { message: "User deleted successfully" } });
    });
  } else {
    // Fallback to in-memory storage
    const userIndex = users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
      return res.status(404).json({ errors: "User not found" });
    }

    users.splice(userIndex, 1);
    res.json({ errors: "", data: { message: "User deleted successfully" } });
  }
};

module.exports = { createUser, getUsers, updateUser, deleteUser };
