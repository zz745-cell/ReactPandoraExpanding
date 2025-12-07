const jwt = require('jsonwebtoken');
const { signToken, verifyToken } = require('../../../src/utils/token');
const { config } = require('../../../src/config/config');

describe('token utils', () => {
  test('signToken creates a JWT that verifyToken can decode', () => {
    const payload = { id: 'user-1', email: 'test@example.com', role: 'user' };

    const token = signToken(payload);

    expect(typeof token).toBe('string');

    const decoded = verifyToken(token);
    expect(decoded).toEqual(expect.objectContaining(payload));
  });

  test('verifyToken throws for invalid token', () => {
    expect(() => verifyToken('not-a-real-token')).toThrow();
  });

  test('signToken respects custom expiresIn options and results in expired token', () => {
    const payload = { id: 'user-1' };

    const expiredToken = signToken(payload, { expiresIn: '-1s' });

    expect(() => verifyToken(expiredToken)).toThrow(/expired/i);
  });

  test('signToken uses configured jwtSecret', () => {
    const payload = { id: 'user-1' };

    const token = signToken(payload);

    const decoded = jwt.verify(token, config.jwtSecret);
    expect(decoded).toEqual(expect.objectContaining(payload));
  });
});


