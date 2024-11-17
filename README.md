# E-commerce Campaign Reporting API

## Project Description

This project is an E-commerce Campaign Reporting API designed to handle file uploads, generate reports, and manage user data related to advertising campaigns. The API allows for the upload of product-related data in CSV format, provides reporting endpoints for campaign, ad group, FSN, and product name-based filtering, and enables user management functionalities like user registration, updating, and deletion.

### Features:
1. **User Management:** Register users, retrieve user details, update user data, and delete users.
2. **File Upload:** Upload CSV files containing product data related to campaigns.
3. **Reporting APIs:** Generate reports for campaign, ad group, FSN ID, and product names.
4. **Authentication:** Secure the routes using JWT-based authentication.

### Technologies Used:
- **Node.js** and **Express.js**
- **JWT Authentication**
- **CSV File Handling** for product uploads
- **Temporary In-memory storage (for demo purposes)**


Setup and Installation
Prerequisites:
Node.js installed on your machine.
npm (Node Package Manager).
(Optional) A database like SQLite, MySQL, or PostgreSQL if you're switching from in-memory storage.
Installation Steps:
Clone the repository:

First, clone the project repository from GitHub to your local machine:

bash
Copy code
git clone <repository_url>
cd ecommerce-reporting-api
Replace <repository_url> with the actual repository URL.

Install dependencies:

Once inside the project directory, run the following command to install the required dependencies:

bash
Copy code
npm install
Setup environment variables:

Create a .env file in the root of your project and add the following variables:

makefile
Copy code
PORT=3000
DB_PATH=<your_db_path>  # (Optional) Path to your SQLite or database URI
JWT_SECRET=<your_jwt_secret>
Run the server:

To start the server, run:

bash
Copy code
npm run start
The server will run on http://localhost:3000 by default.



---

## First Note:

Due to a system issue on my machine, I am currently unable to download the database and my machine is facing significant performance problems, causing it to hang frequently. As a result, I have implemented a **temporary solution** where user data is being stored in an in-memory array instead of a database.

In the production-ready code, if the database connection is available, the data will be stored in the database (SQLite or any other database). Below is the code that would be used if the database connection is active:

```javascript
const db = require('../models/db'); // Assuming db is properly initialized and connected

if (db) {
  // Database operations go here...
} else {
  // Temporary in-memory storage for demonstration
  let users = [];
}
Setup and Installation
Prerequisites:
Node.js installed on your machine.
npm (Node Package Manager).
(Optional) A database like SQLite, MySQL, or PostgreSQL if you're switching from in-memory storage.
Installation Steps:
Clone the repository:

bash
Copy code
git clone <repository_url>
cd ecommerce-reporting-api
Install dependencies:

Run the following command to install the required dependencies:

bash
Copy code
npm install
Setup environment variables:

Create a .env file in the root of your project and add the following variables:

makefile
Copy code
PORT=3000
DB_PATH=<your_db_path>  # (Optional) Path to your SQLite or database URI
JWT_SECRET=<your_jwt_secret>
Run the server:

To start the server, run:

bash
Copy code
npm start
The server will run on http://localhost:3000 by default.

Endpoints
1. Authentication
POST /api/auth/login - Login and generate a JWT token.
2. User Management
POST /api/users/register - Register a new user.
GET /api/users/getusers/:id? - Retrieve a user or all users (optional id parameter).
PUT /api/users/updateuser/:id - Update user details (username, email).
DELETE /api/users/deleteuser/:id - Delete a user by ID.
3. Product Reporting
POST /api/products/upload - Upload a CSV file with product details.
POST /api/products/report/campaign - Report by campaign.
POST /api/products/report/adGroupID - Report by Ad Group ID.
POST /api/products/report/fsnID - Report by FSN ID.
POST /api/products/report/productName - Report by Product Name.
Folder Structure
Here’s an overview of the folder structure for the project:

bash
Copy code
ecommerce-reporting-api/
│
├── controllers/
│   ├── authController.js         # Handles login logic
│   ├── productController.js      # Handles file upload and reporting
│   └── userController.js         # Handles user CRUD operations
│
├── middlewares/
│   └── authMiddleware.js         # JWT Authentication middleware
│
├── routes/
│   ├── authRoutes.js             # Auth related routes
│   ├── productRoutes.js          # Product related routes (upload, report)
│   └── userRoutes.js             # User related routes (CRUD operations)
│
├── models/
│   └── db.js                     # Database connection and initialization (if needed)
│
├── .env                           # Environment variables
├── server.js                      # Main entry point for the server
└── README.md                      # This README file
Temporary In-Memory Storage Code
As mentioned earlier, due to the issue with the database, data is currently stored in an array for temporary use. The code for this fallback solution is:

javascript
Copy code
// Temporary in-memory storage for users if the database is unavailable
let users = [];

const createUser = async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ errors: "Missing fields" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // If DB is available, use DB operations
    if (db) {
      // Check for existing username in DB
      db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, row) => {
        if (err) {
          return res.status(400).json({ errors: "Error checking username: " + err.message });
        }
        if (row) {
          return res.status(400).json({ errors: "Username already exists" });
        }

        db.run(`INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
          [username, hashedPassword, email], function (err) {
            if (err) {
              return res.status(400).json({ errors: "Error inserting user: " + err.message });
            }
            res.json({ errors: "", data: { id: this.lastID, username, email } });
          });
      });
    } else {
      // Temporary in-memory storage (if DB is unavailable)
      const existingUser = users.find(user => user.username === username);
      if (existingUser) {
        return res.status(400).json({ errors: "Username already exists" });
      }

      const newUser = {
        id: users.length + 1,
        username,
        password: hashedPassword,
        email,
      };
      users.push(newUser);

      res.json({ errors: "", data: newUser });
    }
  } catch (err) {
    res.status(500).json({ errors: "Internal server error: " + err.message });
  }
};
