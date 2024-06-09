const express = require('express');
const router = express.Router();
const {
    createOrUpdateBiodata,
    deleteBiodata,
    getBiodatas,
    getBiodataById,
    biodataStats,
    getUserBiodata,
    getBiodataId,
    getBiodataByEmail
} = require('../controllers/biodataController');
const {verifyToken, isAdmin} = require("../middlewares/authMiddleware");

// Create a new biodata
router.post('/biodata',verifyToken, createOrUpdateBiodata);


// Delete a biodata
router.delete('/biodata/:biodataId', deleteBiodata);

// Get all biodatas with filtering and pagination
router.get('/biodatas', getBiodatas);

// Get a single biodata by ID
router.get('/biodata/:biodataId', getBiodataById);
router.get('/biodata/byEmail/:email', getBiodataByEmail);
router.get('/biodata-id/:id', getBiodataId);
router.get('/biodata', verifyToken, getUserBiodata);
router.get('/biodata-stats', verifyToken, isAdmin, biodataStats);

module.exports = router;

