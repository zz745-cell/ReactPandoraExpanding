process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');

function getFreshApp() {
  jest.resetModules();
  const { app } = require('../../src/app');
  return app;
}

describe('health routes', () => {
  test('GET / returns health message', async () => {
    const app = getFreshApp();

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: 'PandoraBE API is running' });
  });
});


