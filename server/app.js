const fs = require('fs');
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
const contactRoutes = require('./routes/contactRoutes');
const adminRoutes = require('./routes/adminRoutes');
const orderRoutes = require('./routes/orderRoutes');

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Behind a host's proxy (Render, Railway), so rate limits see the real client IP
// and req.protocol is https.
app.set('trust proxy', 1);

app.use(cors((req, callback) => {
    const origin = req.get('origin');
    // No Origin header (curl, same-server) is not a browser CORS call. The site's own
    // address is always allowed, because in production Express serves the storefront too.
    const sameSite = origin === `${req.protocol}://${req.get('host')}`;
    if (!origin || sameSite || allowedOrigins.includes(origin)) {
        return callback(null, {
            origin: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
        });
    }
    const error = new Error('Origin is not allowed');
    error.status = 403;
    return callback(error);
}));
app.use(express.json({ limit: '100kb' }));

app.get('/health', (req, res) => {
    res.json({ ok: true });
});

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
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({ success: false, message: 'Not found' });
});

// Production: serve the built storefront from client/dist on the same address as the API.
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(path.join(clientDist, 'index.html'))) {
    app.use(express.static(clientDist, { index: false, maxAge: '1h' }));
    app.get('*', (req, res) => {
        res.sendFile(path.join(clientDist, 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.send('Art of Raziel API is running. Build the storefront with npm run build.');
    });
}

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
