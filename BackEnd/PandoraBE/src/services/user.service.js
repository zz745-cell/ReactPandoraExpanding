const { findUserByEmail } = require('../models/user.model');

async function authenticateUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) {
    return null;
  }

  if (user.password !== password) {
    return null;
  }

  return user;
}

module.exports = {
  authenticateUser,
};


