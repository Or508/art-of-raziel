const path = require('path');
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Load the repo-root .env before routes, so auth.js can see JWT_SECRET at startup.
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Requests without an Origin header (curl, same-server) are not browser CORS calls.
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const error = new Error('Origin is not allowed');
        error.status = 403;
        return callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));
app.use(express.json());

const rateLimitResponse = {
    success: false,
    message: 'Too many requests. Please try again later.',
};

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse,
});

const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: rateLimitResponse,
});

const mutationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS',
    message: rateLimitResponse,
});

app.use('/api/auth', authLimiter);
app.use('/api/products', mutationLimiter);
app.use('/api/admin', mutationLimiter);
app.use('/api/orders', mutationLimiter);
app.use('/api/contact', (req, res, next) => {
    if (req.method === 'POST') {
        return contactLimiter(req, res, next);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD' && req.method !== 'OPTIONS') {
        return mutationLimiter(req, res, next);
    }
    return next();
});

app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
    res.send('<h1>Art of Raziel - השרת מחובר למוצרים! 🕯️</h1>');
});

// Last middleware. Controllers that already sent a response never reach this.
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    const status = Number(err.status || err.statusCode) || 500;
    console.error('Request error:', {
        method: req.method,
        path: req.originalUrl,
        status,
        message: err.message,
        sqlMessage: err.sqlMessage,
    });

    if (status >= 500) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
        });
    }

    return res.status(status).json({
        success: false,
        message: err.message || 'Request failed',
    });
});

app.listen(PORT, () => {
    console.log(`🚀 שרת רץ בכתובת: http://localhost:${PORT}`);
});
