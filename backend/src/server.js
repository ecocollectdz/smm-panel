require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');
const serviceRoutes = require('./routes/services');
const paymentRoutes = require('./routes/payments');
const adminRoutes = require('./routes/admin');

const app = express();

app.set('trust proxy', 1);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ─── Database Connection ────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('✅ MongoDB connected'))
  .catch(err => { logger.error('MongoDB connection failed:', err); process.exit(1); });

// ─── Global Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Stripe webhook needs raw body - mount BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging
app.use(morgan('combined', {
  stream: { write: msg => logger.http(msg.trim()) }
}));

// ─── Rate Limiting ──────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts, try again in 15 minutes.' }
});

app.use('/api', globalLimiter);
app.use('/api/auth', authLimiter);

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'SMM Panel API running', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});


// TEMP SEED ROUTE - DELETE AFTER USE
app.get('/api/do-seed', async (req, res) => {
  if (req.query.key !== 'smmflow2024') return res.status(403).json({ message: 'Forbidden' });
  try {
    const User = require('./models/User');
    const Service = require('./models/Service');

    let results = [];

    const adminExists = await User.findOne({ email: 'admin@smmflow.com' });
    if (!adminExists) {
      await User.create({ name: 'Admin', email: 'admin@smmflow.com', password: 'admin123456', role: 'admin', balance: 9999 });
      results.push('Admin created');
    } else {
      results.push('Admin already exists');
    }

    const demoExists = await User.findOne({ email: 'demo@smmflow.com' });
    if (!demoExists) {
      await User.create({ name: 'Demo User', email: 'demo@smmflow.com', password: 'demo123456', balance: 25 });
      results.push('Demo user created');
    }

    const count = await Service.countDocuments();
    if (count === 0) {
      await Service.insertMany([
        { name: 'Instagram Followers – HQ', category: 'Instagram', type: 'Followers', providerServiceId: '1', providerRate: 0.80, rate: 1.60, minOrder: 100, maxOrder: 50000 },
        { name: 'Instagram Likes', category: 'Instagram', type: 'Likes', providerServiceId: '2', providerRate: 0.20, rate: 0.50, minOrder: 50, maxOrder: 100000 },
        { name: 'Instagram Views', category: 'Instagram', type: 'Views', providerServiceId: '3', providerRate: 0.05, rate: 0.12, minOrder: 100, maxOrder: 1000000 },
        { name: 'TikTok Followers', category: 'TikTok', type: 'Followers', providerServiceId: '10', providerRate: 0.60, rate: 1.20, minOrder: 100, maxOrder: 100000 },
        { name: 'TikTok Views', category: 'TikTok', type: 'Views', providerServiceId: '11', providerRate: 0.04, rate: 0.09, minOrder: 1000, maxOrder: 5000000 },
        { name: 'TikTok Likes', category: 'TikTok', type: 'Likes', providerServiceId: '12', providerRate: 0.15, rate: 0.35, minOrder: 50, maxOrder: 200000 },
        { name: 'YouTube Views', category: 'YouTube', type: 'Views', providerServiceId: '20', providerRate: 1.50, rate: 3.00, minOrder: 500, maxOrder: 500000 },
        { name: 'YouTube Subscribers', category: 'YouTube', type: 'Subscribers', providerServiceId: '21', providerRate: 2.50, rate: 5.00, minOrder: 100, maxOrder: 20000 },
        { name: 'Twitter Followers', category: 'Twitter', type: 'Followers', providerServiceId: '30', providerRate: 1.20, rate: 2.50, minOrder: 100, maxOrder: 30000 },
        { name: 'Telegram Members', category: 'Telegram', type: 'Members', providerServiceId: '40', providerRate: 1.00, rate: 2.00, minOrder: 100, maxOrder: 100000 },
      ]);
      results.push('10 services created');
    } else {
      results.push(`${count} services already exist`);
    }

    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});




// ─── Error Handler ──────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  mongoose.connection.close().then(() => process.exit(0));
});


module.exports = app;
