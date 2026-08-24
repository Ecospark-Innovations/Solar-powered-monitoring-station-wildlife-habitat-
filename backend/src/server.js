require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');

const telemetryRoutes = require('./routes/telemetry');
const eventsRoutes = require('./routes/events');
const devicesRoutes = require('./routes/devices');
const cameraRoutes = require('./routes/camera');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

const db = require('./db');
const { errorHandler, validationErrorHandler } = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes (require JWT)
app.use('/api/telemetry', authMiddleware, telemetryRoutes);
app.use('/api/events', authMiddleware, eventsRoutes);
app.use('/api/devices', authMiddleware, devicesRoutes);
app.use('/api/camera', authMiddleware, cameraRoutes);
app.use('/api/users', authMiddleware, usersRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The requested resource ${req.path} was not found`,
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use(validationErrorHandler);
app.use(errorHandler);

// Database connection and server start
db.sequelize.authenticate()
  .then(() => {
    console.log('Database connection established');
    
    // Sync database models
    return db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  })
  .then(() => {
    console.log('Database models synchronized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`\n🌍 Server running on port ${PORT}`);
      console.log(`📊 API Documentation: http://localhost:${PORT}/api/docs`);
      console.log(`🏢 Health check: http://localhost:${PORT}/health`);
      console.log(`\nEnvironment: ${process.env.NODE_ENV}`);
      console.log(`Database: ${process.env.DATABASE_URL}\n`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = app;
