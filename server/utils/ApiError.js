// A lightweight custom error class that carries an HTTP status code.
// Controllers throw this (via asyncHandler) so the centralized error
// handler can respond with the right status code and a clear message.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
