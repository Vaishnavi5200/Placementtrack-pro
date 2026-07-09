const jwt = require('jsonwebtoken');

// Generates a signed JWT for a given user id. The token is used as a
// Bearer token by the client on every subsequent authenticated request.
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = generateToken;
