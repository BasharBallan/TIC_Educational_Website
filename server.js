const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

// Load environment variables
dotenv.config({ path: 'config.env' });

// Import middlewares & utils
const langMiddleware = require('./middlewares/langMiddleware');
const dbConnection = require('./config/database');
const mountRoutes = require('./routes');
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');

// Connect with DB
dbConnection();

// Initialize express app
const app = express();

// Enable CORS
app.use(cors());
app.options('*', cors());

// Compress all responses
app.use(compression());


// Body parser & static files
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'uploads')));

// Logger in development mode
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
  console.log(`Mode: ${process.env.NODE_ENV}`);
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, 
  message: 'Too many requests from this IP, please try again later',
});
app.use('/api', limiter);

// Prevent HTTP Parameter Pollution
app.use(
  hpp({
    whitelist: ['price', 'sold', 'quantity', 'ratingsAverage', 'ratingsQuantity'],
  })
);

// Custom language middleware
app.use(langMiddleware);

// Mount routes
mountRoutes(app);

// Handle unknown routes
app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalError);

// Start server
const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`UnhandledRejection Error: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error('Shutting down server...');
    process.exit(1);
  });
});

// Handle uncaught exceptions (اختياري)
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error('Shutting down due to uncaught exception...');
    process.exit(1);
  });
});
