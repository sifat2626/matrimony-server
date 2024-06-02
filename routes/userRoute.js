const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/userController');

// Route to create a user (after Firebase signup/login)
router.post('/users', createUser);

// Route to add biodata to a user

module.exports = router;