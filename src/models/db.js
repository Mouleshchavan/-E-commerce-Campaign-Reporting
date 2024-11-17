const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./ecommerce.db');

// Initialize tables if they don't exist
db.serialize(() => {
  // Users Table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT
    )
  `);

  // Products Table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campaignName TEXT,
      adGroupID TEXT,
      fsnID TEXT,
      productName TEXT,
      adSpend REAL,
      views INTEGER,
      clicks INTEGER,
      directRevenue REAL,
      indirectRevenue REAL,
      directUnits INTEGER,
      indirectUnits INTEGER
    )
  `);
});

module.exports = db;



