const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key';

exports.authenticateCompany = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), SECRET_KEY);
        req.companyID = decoded.companyID; // Store companyID in request
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};
