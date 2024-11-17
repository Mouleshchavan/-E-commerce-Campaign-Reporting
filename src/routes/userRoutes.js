const express = require('express');
const router = express.Router();
const { createUser, getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');


// Route to register a user
router.post('/register', createUser);

// Route to get users (all or specific by ID)
router.get('/getusers/:id?',authenticateToken, getUsers);

// Route to update a user by ID
router.put('/updateuser/:id',authenticateToken, updateUser);

// Route to delete a user by ID
router.delete('/deleteuser/:id',authenticateToken, deleteUser);

module.exports = router;
