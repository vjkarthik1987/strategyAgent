const express = require('express');
const router = express.Router();
const Objective = require('../models/Objective'); // Import Objective model
const authenticateUser = require('../middleware/auth'); // Middleware for user authentication

router.get('/:companyID/objectives/test', (req, res) => {
    res.json({ message: 'Objectives API is working!' });
});

module.exports = router;