require('dotenv').config();

const config = {
  port: process.env.PORT || 5001,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
};

module.exports = { config };


