const authenticateCompanySession = (req, res, next) => {
    console.log("Session companyID:", req.session.companyID);
    console.log("Requested companyID:", req.params.companyID);

    if (!req.session.companyID) {
        return res.status(403).json({ error: 'Unauthorized: Please log in as a company' });
    }

    if (req.session.companyID !== req.params.companyID) {
        return res.status(403).json({ error: 'Unauthorized: You can only access your own company users' });
    }

    next();
};

module.exports = authenticateCompanySession;