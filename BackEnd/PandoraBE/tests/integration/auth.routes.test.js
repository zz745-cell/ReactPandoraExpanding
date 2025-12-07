process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');

function getFreshApp() {
  jest.resetModules();
  const { app } = require('../../src/app');
  return app;
}

describe('auth routes', () => {
  test('POST /auth/login returns 400 when missing fields', async () => {
    const app = getFreshApp();

    const res = await request(app).post('/auth/login').send({ email: 'a@b.com' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Email and password are required' });
  });

  test('POST /auth/login returns token and user on success', async () => {
    const app = getFreshApp();

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token'); // backwards compat (token === accessToken)
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toEqual(
      expect.objectContaining({
        id: 'user-1',
        email: 'test@example.com',
        role: 'user',
      })
    );
  });

  test('POST /auth/refresh returns 400 when no token provided', async () => {
    const app = getFreshApp();

    const res = await request(app).post('/auth/refresh').send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Refresh token is required' });
  });
});


