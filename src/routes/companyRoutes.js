const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';
const { authenticateCompany } = require('../middleware/auth'); // ✅ Import authentication middleware
const authenticateCompanySession = require('../middleware/authenticateCompanySession');

// Create a new company
router.post(
    '/companies',
    [
      body('name').notEmpty().withMessage('Name is required'),
      body('email').isEmail().withMessage('Invalid email'),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      try {
        const company = new Company(req.body);
        const savedCompany = await company.save();
        res.status(201).json(savedCompany);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    }
);

// Get all companies
router.get('/companies', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    try {
      const companies = await Company.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      const count = await Company.countDocuments();
      res.json({
        companies,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Get a single company
router.get('/companies/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a company
router.put('/companies/:id', async (req, res) => {
  try {
    const updatedCompany = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCompany) return res.status(404).json({ error: 'Company not found' });
    res.json(updatedCompany);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a company
router.delete('/companies/:id', async (req, res) => {
  try {
    const deletedCompany = await Company.findByIdAndDelete(req.params.id);
    if (!deletedCompany) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//Login route //
router.post('/companies/login', async (req, res) => {
  try {
      const { email, password } = req.body;

      const company = await Company.findOne({ email });
      if (!company) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, company.password);
      if (!isMatch) {
          return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Store company ID in session
      req.session.companyID = company._id;

      // Generate JWT
      const token = jwt.sign(
          { companyID: company._id, email: company.email },
          process.env.JWT_SECRET || 'your_secret_key',
          { expiresIn: '1h' }
      );

      console.log("✅ Company logged in, session set:", req.session.companyID);
      res.json({
          message: 'Company login successful',
          token,  // 🔥 Return token here
          company: {
              id: company._id,
              name: company.name,
              email: company.email
          }
      });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});



/**
 * ✅ Get users (Only Authenticated Company Admins)
 * Route: POST /api/:companyID/users
 */

router.get('/:companyID/users', authenticateCompanySession, async (req, res) => {
  try {
      const companyID = req.session.companyID; // Get the logged-in company ID
      console.log(companyID);
      console.log(req.params.companyID);

      // Ensure the logged-in company matches the requested companyID
      if (companyID !== req.params.companyID) {
          return res.status(403).json({ error: 'Unauthorized: You can only access your own company users' });
      }

      const users = await User.find({ company: companyID }).select('-password');
      res.json(users);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Get single user (Only Authenticated Company Admins)
 * Route: POST /api/:companyID/users
 */

router.get('/:companyID/users/:userID', authenticateCompanySession, async (req, res) => {
  try {
      const companyID = req.session.companyID; // Get the logged-in company ID

      // Ensure the logged-in company matches the requested companyID
      if (companyID !== req.params.companyID) {
          return res.status(403).json({ error: 'Unauthorized: You can only access your own company users' });
      }

      const user = await User.findOne({ _id: req.params.userID, company: companyID }).select('-password');
      if (!user) {
          return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});


module.exports = router;
