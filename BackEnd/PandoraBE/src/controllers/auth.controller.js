const { signToken } = require('../utils/token');

// NOTE: For now this is a dummy implementation.
// In a real app, replace this with a lookup in your users table / DB.
async function login(req, res, next) {
  try {
    console.log("here");
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // TODO: replace with real validation / password check
    // Example: if (email !== 'test@example.com' || password !== 'password') { ... }

    const userPayload = {
      id: 'user-1',
      email,
      role: 'user',
    };

    const token = signToken(userPayload);

    return res.json({ token, user: userPayload });
  } catch (err) {
    return next(err);
  }
}

module.exports = { login };


