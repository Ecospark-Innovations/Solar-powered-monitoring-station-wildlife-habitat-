const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const deviceRoutes = require('./routes/devices');
const cameraRoutes = require('./routes/camera');
const userRoutes = require('./routes/users');
const telemetryRoutes = require('./routes/telemetry');
const eventsRoutes = require('./routes/events');
const { authMiddleware } = require('./middleware/auth');
const { errorHandler, validationErrorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(compression());
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3001',
  credentials: true
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/devices', authMiddleware, deviceRoutes);
app.use('/api/camera', authMiddleware, cameraRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/telemetry', telemetryRoutes); // Device telemetry can be public
app.use('/api/events', authMiddleware, eventsRoutes);

// Error handling
app.use(validationErrorHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💯 CORS Origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:3001'}\n`);
});

module.exports = app;
