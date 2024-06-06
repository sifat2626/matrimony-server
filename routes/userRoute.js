const express = require('express');
const router = express.Router();
const { createUser, requestContact, requestedContacts,acceptContact, getRole,rejectContact, requestedContactsByUser,
    allContactsByUser,removeContact, getApprovedContactsForAllUsers, getApprovedContactsByUser,getRevenueCount,
    getAllUsers, updatePremium, updateRole, getUser, requestPremium, allPremiumRequests
} = require('../controllers/userController');
const {verifyToken, isAdmin} = require("../middlewares/authMiddleware");

// Route to create a user (after Firebase signup/login)
router.post('/users', createUser);
router.get('/all-users', getAllUsers);
router.get('/user', verifyToken, getUser);
router.get('/request-premium', verifyToken, requestPremium);
router.get('/all-premium-requests', verifyToken,isAdmin, allPremiumRequests);
router.post('/request/:biodataId', verifyToken, requestContact);
router.post('/accept/:email/:biodataId', verifyToken,isAdmin, acceptContact);
router.post('/reject/:email/:biodataId', verifyToken,isAdmin, rejectContact);
router.put('/update-premium/:id', verifyToken,isAdmin, updatePremium);
router.put('/update-role/:id', verifyToken,isAdmin, updateRole);
router.get('/get-role/:id', verifyToken,isAdmin, getRole);
router.get('/requests', verifyToken,isAdmin, requestedContacts);
router.get('/requests/user', verifyToken, requestedContactsByUser);
router.get('/requests/user/all', verifyToken, allContactsByUser);
router.get('/requests/accepted', verifyToken, getApprovedContactsByUser);
router.get('/requests/accepted/all', verifyToken,isAdmin, getApprovedContactsForAllUsers);
router.get('/revenue/count', verifyToken,isAdmin, getRevenueCount);
router.get('/getRole', verifyToken, getRole);
router.delete('/remove/:biodataId', verifyToken, removeContact);

// Route to add biodata to a user

module.exports = router;