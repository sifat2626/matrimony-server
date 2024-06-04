const express = require('express');
const router = express.Router();
const { createUser, requestContact, requestedContacts,acceptContact, getRole} = require('../controllers/userController');
const {verifyToken, isAdmin} = require("../middlewares/authMiddleware");

// Route to create a user (after Firebase signup/login)
router.post('/users', createUser);
router.post('/request/:biodataId', verifyToken, requestContact);
router.post('/accept/:email/:biodataId', verifyToken,isAdmin, acceptContact);
router.get('/requests', verifyToken,isAdmin, requestedContacts);
router.get('/getRole', verifyToken, getRole);

// Route to add biodata to a user

module.exports = router;