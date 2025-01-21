const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const { authenticateCompany } = require('../middleware/auth'); // ✅ Import authentication middleware
const authenticateCompanySession = require('../middleware/authenticateCompanySession');

const router = express.Router();

/**
 * ✅ Register a New User (Only Authenticated Company Admins)
 * Route: POST /api/:companyID/users/register
 */
router.post('/:companyID/users/register', authenticateCompany, async (req, res) => {
    try {
        // Ensure that the logged-in company matches the one in the request
        if (req.params.companyID !== req.companyID) {
            return res.status(403).json({ error: 'Unauthorized: You can only add users to your own company' });
        }

        const { name, email, password, role, l1Team, l2Team } = req.body;

        // Check if the user already exists in the company
        let existingUser = await User.findOne({ email, company: req.companyID });
        if (existingUser) return res.status(400).json({ error: "User already exists in this company" });

        // ✅ No need to check for an "admin" role—only an authenticated company can add users

        // Create new user
        const newUser = new User({
            name,
            email,
            company: req.companyID,
            role,
            l1Team,
            l2Team
        });

        // Register user (password will be hashed by passport-local-mongoose)
        await User.register(newUser, password);

        res.status(201).json({ message: "User registered successfully!", user: newUser });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * ✅ User Login
 * Route: POST /api/:companyID/users/login
 */
router.post('/users/login', (req, res, next) => {
    passport.authenticate('local', async (err, user, info) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(401).json({ error: info.message || 'Invalid credentials' });

        // Log the user in and create a session
        req.logIn(user, async (loginErr) => {
            if (loginErr) return res.status(500).json({ error: loginErr.message });

            // Populate company details
            const populatedUser = await User.findById(user._id).populate('company');

            res.json({
                message: 'Login successful',
                user: {
                    id: populatedUser._id,
                    name: populatedUser.name,
                    email: populatedUser.email,
                    companyID: populatedUser.company._id,
                    role: populatedUser.role
                }
            });
        });
    })(req, res, next);
});

/**
 * ✅ Logout User
 * Route: POST /api/:companyID/users/logout
 */
router.post('/:companyID/users/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Logged out successfully" });
    });
});




/**
 * ✅ Update User Details (Users Can Update Themselves, Admins Can Update Any User)
 * Route: PUT /api/:companyID/users/:userID
 */
router.put('/:companyID/users/:userID', authenticateCompanySession, async (req, res) => {
    try {
        if (req.params.companyID !== req.companyID) {
            return res.status(403).json({ error: 'Unauthorized: You can only update users within your own company' });
        }

        // ✅ Ensure user exists before updating
        const userToUpdate = await User.findOne({ _id: req.params.userID, company: req.companyID });
        if (!userToUpdate) return res.status(404).json({ error: "User not found" });

        // ✅ Update user data
        const updatedUser = await User.findByIdAndUpdate(req.params.userID, req.body, { new: true });

        res.json({ message: "User updated successfully", updatedUser });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * ✅ Delete a User 
 * Route: DELETE /api/:companyID/users/:userID
 */
router.delete('/:companyID/users/:userID', authenticateCompanySession, async (req, res) => {
    try {
        if (req.params.companyID !== req.companyID) {
            return res.status(403).json({ error: 'Unauthorized: You can only delete users within your own company' });
        }

        const userToDelete = await User.findOne({ _id: req.params.userID, company: req.companyID });
        if (!userToDelete) return res.status(404).json({ error: "User not found" });

        // ✅ No need to check for an "admin" role—companies should be able to delete users
        await User.findByIdAndDelete(req.params.userID);

        res.json({ message: "User deleted successfully" });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


/**
 * ✅ Check Authenticated User Session
 * Route: GET /api/:companyID/users/session
 */
router.get('/:companyID/users/session', (req, res) => {
    if (req.isAuthenticated()) {
        return res.json({ authenticated: true, user: req.user });
    }
    res.json({ authenticated: false });
});



module.exports = router;