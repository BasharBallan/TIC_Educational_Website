const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const cookieParser = require("cookie-parser"); 

const langMiddleware = require('./middlewares/langMiddleware');
const mountRoutes = require('./routes');
const ApiError = require('./utils/apiError');
const globalError = require('./middlewares/errorMiddleware');

const app = express();

// Enable CORS
app.use(cors());
app.options('*', cors());

// Compress responses
app.use(compression());

// Body parser
app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, 'uploads')));

//cookie parser
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
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
app.use("/uploads", express.static("uploads"));

// Swagger
const { swaggerUi, swaggerSpec } = require("./swagger");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Mount routes
mountRoutes(app);

// Handle unknown routes
app.all('*', (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 404));
});

// Global error handler
app.use(globalError);

module.exports = app;
