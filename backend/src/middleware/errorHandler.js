const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Database errors
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: 'Duplicate entry',
      field: err.errors[0].path,
      value: err.errors[0].value
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

const validationErrorHandler = (err, req, res, next) => {
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Validation error',
      message: err.message
    });
  }
  next(err);
};

module.exports = {
  errorHandler,
  validationErrorHandler
};
