const { createMockReqResNext } = require('../../helpers/mockReqResNext');
const { requireRole } = require('../../../src/middleware/requireRole');

describe('requireRole middleware', () => {
  test('returns 403 when req.user is missing', () => {
    const middleware = requireRole('admin');
    const { req, res, next } = createMockReqResNext();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 403 when role not allowed', () => {
    const middleware = requireRole('admin');
    const { req, res, next } = createMockReqResNext();
    req.user = { id: 'user-1', role: 'user' };

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  test('calls next when role allowed', () => {
    const middleware = requireRole('admin', 'user');
    const { req, res, next } = createMockReqResNext();
    req.user = { id: 'admin-1', role: 'admin' };

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});


