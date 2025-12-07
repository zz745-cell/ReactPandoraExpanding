const { createMockReqResNext } = require('../../helpers/mockReqResNext');

jest.mock('../../../src/utils/token', () => ({
  verifyAccessToken: jest.fn(),
}));

const { verifyAccessToken } = require('../../../src/utils/token');
const { authMiddleware } = require('../../../src/middleware/auth.middleware');

describe('auth.middleware', () => {
  test('returns 401 when authorization header is missing', () => {
    const { req, res, next } = createMockReqResNext({ headers: {} });

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Authorization token missing',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 when token is invalid', () => {
    verifyAccessToken.mockImplementation(() => {
      throw new Error('invalid token');
    });

    const { req, res, next } = createMockReqResNext({
      headers: { authorization: 'Bearer invalid' },
    });

    authMiddleware(req, res, next);

    expect(verifyAccessToken).toHaveBeenCalledWith('invalid');
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Invalid or expired token',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('sets req.user and calls next when token is valid', () => {
    verifyAccessToken.mockReturnValue({
      id: 'user-1',
      email: 'test@example.com',
      role: 'user',
    });

    const { req, res, next } = createMockReqResNext({
      headers: { authorization: 'Bearer validtoken' },
    });

    authMiddleware(req, res, next);

    expect(verifyAccessToken).toHaveBeenCalledWith('validtoken');
    expect(req.user).toEqual({
      id: 'user-1',
      email: 'test@example.com',
      role: 'user',
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});


