process.env.JWT_SECRET = 'test-secret';

const request = require('supertest');

function getFreshAppAndTokens() {
  jest.resetModules();
  const { app } = require('../../src/app');
  const { signToken } = require('../../src/utils/token');
  const userToken = signToken({
    id: 'user-1',
    email: 'test@example.com',
    role: 'user',
  });
  const adminToken = signToken({
    id: 'admin-1',
    email: 'admin@example.com',
    role: 'admin',
  });
  const guestToken = signToken({
    id: 'guest-1',
    email: 'guest@example.com',
    role: 'guest',
  });
  return { app, userToken, adminToken, guestToken };
}

describe('products routes', () => {
  test('GET /api/products returns 401 when no token', async () => {
    const { app } = getFreshAppAndTokens();

    const res = await request(app).get('/api/products');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Authorization token missing' });
  });

  test('GET /api/products returns products when authorized', async () => {
    const { app, userToken } = getFreshAppAndTokens();

    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/products returns 403 when role is not allowed', async () => {
    const { app, guestToken } = getFreshAppAndTokens();

    const res = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${guestToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Forbidden' });
  });

  test('POST /api/products returns 403 for user role', async () => {
    const { app, userToken } = getFreshAppAndTokens();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Should fail' });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Forbidden' });
  });

  test('POST /api/products returns 400 when name missing (admin)', async () => {
    const { app, adminToken } = getFreshAppAndTokens();

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 10 });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Name is required' });
  });

  test('POST /api/products creates product and then can be fetched (admin)', async () => {
    const { app, adminToken } = getFreshAppAndTokens();

    const listBefore = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${adminToken}`);
    const initialCount = listBefore.body.length;

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New product', price: 12.5, description: 'desc' });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: 'New product',
        price: 12.5,
        description: 'desc',
      })
    );

    const listAfter = await request(app)
      .get('/api/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listAfter.body.length).toBe(initialCount + 1);
  });

  test('GET /api/products/:id returns 404 for missing product', async () => {
    const { app, userToken } = getFreshAppAndTokens();

    const res = await request(app)
      .get('/api/products/9999')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Product not found' });
  });

  test('PUT /api/products/:id updates existing product (admin)', async () => {
    const { app, adminToken } = getFreshAppAndTokens();

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'To update', price: 1 });

    const productId = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated name', price: 2 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toEqual(
      expect.objectContaining({
        id: productId,
        name: 'Updated name',
        price: 2,
      })
    );
  });

  test('DELETE /api/products/:id returns 204 for existing product (admin)', async () => {
    const { app, adminToken } = getFreshAppAndTokens();

    const createRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'To delete' });

    const productId = createRes.body.id;

    const deleteRes = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(204);
  });
});


