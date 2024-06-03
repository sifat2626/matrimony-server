const express = require('express');
const router = express.Router();
const { createUser, requestContact, requestedContacts,acceptContact} = require('../controllers/userController');
const {verifyToken, isAdmin} = require("../middlewares/authMiddleware");

// Route to create a user (after Firebase signup/login)
router.post('/users', createUser);
router.post('/request/:biodataId', verifyToken,isAdmin, requestContact);
router.post('/accept/:biodataId', verifyToken,isAdmin, acceptContact);
router.get('/requests', verifyToken, requestedContacts);

// Route to add biodata to a user

module.exports = router;