const express = require('express');
const router = express.Router();
const {
    createOrUpdateBiodata,
    deleteBiodata,
    getBiodatas,
    getBiodataById,
    biodataStats
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
router.get('/biodata-stats', verifyToken, isAdmin, biodataStats);

module.exports = router;

