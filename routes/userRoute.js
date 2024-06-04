const express = require('express');
const router = express.Router();
const { createUser, requestContact, requestedContacts,acceptContact, getRole,rejectContact, requestedContactsByUser,
    allContactsByUser,removeContact
} = require('../controllers/userController');
const {verifyToken, isAdmin} = require("../middlewares/authMiddleware");

// Route to create a user (after Firebase signup/login)
router.post('/users', createUser);
router.post('/request/:biodataId', verifyToken, requestContact);
router.post('/accept/:email/:biodataId', verifyToken,isAdmin, acceptContact);
router.post('/reject/:email/:biodataId', verifyToken,isAdmin, rejectContact);
router.get('/requests', verifyToken,isAdmin, requestedContacts);
router.get('/requests/user', verifyToken, requestedContactsByUser);
router.get('/requests/user/all', verifyToken, allContactsByUser);
router.get('/requests/accepted', verifyToken, acceptContact);
router.get('/getRole', verifyToken, getRole);
router.delete('/remove/:biodataId', verifyToken, removeContact);

// Route to add biodata to a user

module.exports = router;