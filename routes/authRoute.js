const express = require('express');
const router = express.Router();
const {createToken, clearCookie} = require("../controllers/authController");

router.post('/jwt', createToken);
router.get('/logout', clearCookie);



module.exports = router;
