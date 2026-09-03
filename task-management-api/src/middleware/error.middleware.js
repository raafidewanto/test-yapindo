const { ZodError } = require('zod');

const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation error',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  const statusCode = error.status || 500;

  res.status(statusCode).json({
    message:
      statusCode === 500
        ? 'Internal server error'
        : error.message,
  });
};

module.exports = errorHandler;