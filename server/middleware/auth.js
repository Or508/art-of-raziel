const path = require('path');
const jwt = require('jsonwebtoken');

// Root .env (same file server/config/db.js loads). Default dotenv looks in cwd.
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || !String(JWT_SECRET).trim()) {
    throw new Error(
        'Configuration error: JWT_SECRET is not set. Add JWT_SECRET to the root .env file before starting the server.'
    );
}

// Verify user token
const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token'];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'No token provided. Access denied.' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token.' 
        });
    }
};

// Verify admin token
const verifyAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.headers['x-auth-token'];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'No token provided. Access denied.' 
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required.' 
            });
        }
        
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Invalid or expired token.' 
        });
    }
};

// Generate JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
    verifyToken,
    verifyAdmin,
    generateToken
};
