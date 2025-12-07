const { createMockReqResNext } = require('../../helpers/mockReqResNext');

jest.mock('../../../src/utils/token', () => ({
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

jest.mock('../../../src/services/refreshSession.service', () => ({
  createRefreshSession: jest.fn(),
  isRefreshSessionActive: jest.fn(),
  revokeRefreshSession: jest.fn(),
  revokeAllRefreshSessions: jest.fn(),
}));

const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require('../../../src/utils/token');
const {
  createRefreshSession,
  isRefreshSessionActive,
  revokeRefreshSession,
  revokeAllRefreshSessions,
} = require('../../../src/services/refreshSession.service');
const { login, refreshToken, logout } = require('../../../src/controllers/auth.controller');

describe('auth.controller', () => {
  describe('login', () => {
    test('returns 400 when email is missing', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { password: 'password' },
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 400 when password is missing', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { email: 'test@example.com' },
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Email and password are required',
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('returns token and user payload on success', async () => {
      signAccessToken.mockReturnValue('mock-access-token');
      signRefreshToken.mockReturnValue('mock-refresh-token');
      createRefreshSession.mockReturnValue({ jti: 'jti-1' });

      const { req, res, next } = createMockReqResNext({
        body: { email: 'test@example.com', password: 'password' },
      });

      await login(req, res, next);

      expect(signAccessToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          email: 'test@example.com',
          role: 'user',
        })
      );
      expect(signRefreshToken).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-1',
          email: 'test@example.com',
          role: 'user',
        }),
        { jwtid: 'jti-1' }
      );
      expect(createRefreshSession).toHaveBeenCalledWith('user-1');
      expect(res.json).toHaveBeenCalledWith({
        token: 'mock-access-token',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          role: 'user',
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('returns 401 when credentials are invalid', async () => {
      const { req, res, next } = createMockReqResNext({
        body: { email: 'test@example.com', password: 'wrong' },
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid email or password',
      });
      expect(signAccessToken).not.toHaveBeenCalled();
      expect(signRefreshToken).not.toHaveBeenCalled();
      expect(createRefreshSession).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('refreshToken', () => {
    test('returns 400 when no token is provided', async () => {
      const { req, res, next } = createMockReqResNext({
        body: {},
        headers: {},
      });

      await refreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Refresh token is required' });
    });

    test('returns 401 when verifyRefreshToken throws', async () => {
      verifyRefreshToken.mockImplementation(() => {
        throw new Error('bad token');
      });

      const { req, res, next } = createMockReqResNext({
        headers: { authorization: 'Bearer invalid' },
      });

      await refreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token',
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('creates new token from decoded payload without standard JWT fields', async () => {
      verifyRefreshToken.mockReturnValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'user',
        jti: 'old-jti',
        iat: 123,
        exp: 456,
      });
      signAccessToken.mockReturnValue('new-mock-access-token');
      signRefreshToken.mockReturnValue('new-mock-refresh-token');
      isRefreshSessionActive.mockReturnValue(true);
      createRefreshSession.mockReturnValue({ jti: 'new-jti' });

      const { req, res, next } = createMockReqResNext({
        headers: { authorization: 'Bearer oldtoken' },
      });

      await refreshToken(req, res, next);

      expect(signAccessToken).toHaveBeenCalledWith({
        id: 'user-1',
        email: 'test@example.com',
        role: 'user',
      });
      expect(isRefreshSessionActive).toHaveBeenCalledWith('user-1', 'old-jti');
      expect(revokeRefreshSession).toHaveBeenCalledWith('user-1', 'old-jti');
      expect(createRefreshSession).toHaveBeenCalledWith('user-1');
      expect(signRefreshToken).toHaveBeenCalledWith(
        {
          id: 'user-1',
          email: 'test@example.com',
          role: 'user',
        },
        { jwtid: 'new-jti' }
      );
      expect(res.json).toHaveBeenCalledWith({
        token: 'new-mock-access-token',
        accessToken: 'new-mock-access-token',
        refreshToken: 'new-mock-refresh-token',
        user: {
          id: 'user-1',
          email: 'test@example.com',
          role: 'user',
        },
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('revokes all sessions and returns 401 when refresh session is not active (replay)', async () => {
      verifyRefreshToken.mockReturnValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'user',
        jti: 'old-jti',
      });
      isRefreshSessionActive.mockReturnValue(false);

      const { req, res, next } = createMockReqResNext({
        headers: { authorization: 'Bearer oldtoken' },
      });

      await refreshToken(req, res, next);

      expect(isRefreshSessionActive).toHaveBeenCalledWith('user-1', 'old-jti');
      expect(revokeAllRefreshSessions).toHaveBeenCalledWith('user-1');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    });
  });

  describe('logout', () => {
    test('returns 400 when no token is provided', async () => {
      const { req, res, next } = createMockReqResNext({
        body: {},
        headers: {},
      });

      await logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Refresh token is required' });
    });

    test('returns 401 when verifyRefreshToken throws', async () => {
      verifyRefreshToken.mockImplementation(() => {
        throw new Error('bad token');
      });

      const { req, res, next } = createMockReqResNext({
        headers: { authorization: 'Bearer invalid' },
      });

      await logout(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    test('revokes refresh session and returns 204', async () => {
      verifyRefreshToken.mockReturnValue({
        id: 'user-1',
        email: 'test@example.com',
        role: 'user',
        jti: 'logout-jti',
      });

      const { req, res, next } = createMockReqResNext({
        body: { refreshToken: 'some-refresh' },
        headers: {},
      });

      await logout(req, res, next);

      expect(revokeRefreshSession).toHaveBeenCalledWith('user-1', 'logout-jti');
      expect(res.sendStatus).toHaveBeenCalledWith(204);
      expect(next).not.toHaveBeenCalled();
    });
  });
});


