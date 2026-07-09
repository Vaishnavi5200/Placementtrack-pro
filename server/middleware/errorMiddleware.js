// Handles any request that didn't match a route with a consistent JSON 404,
// instead of Express's default HTML error page.
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Centralized error handler. Every thrown/forwarded error (validation,
// duplicate key, invalid ObjectId, custom ApiError, etc.) ends up here
// so the API always responds with a consistent JSON shape.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server error';

  // Mongoose invalid ObjectId (e.g. malformed :id param)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 400;
    message = 'Invalid resource id';
  }

  // Mongoose schema validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join('. ');
  }

  // Duplicate key error (e.g. registering with an email already in use)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `An account with that ${field} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Never leak stack traces outside development.
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };
