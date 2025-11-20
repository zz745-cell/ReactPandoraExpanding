const express = require('express');
const { getHealth } = require('../controllers/health.controller');
const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/products.controller');
const authRoutes = require('./auth.routes');
const { authMiddleware } = require('../middleware/auth.middleware');

// In a larger app, you'd import sub-routers here, e.g.:
// const productsRoutes = require('./products.routes');

function applyRoutes(app) {
  const router = express.Router();

  // Public routes (no token required)
  router.get('/', getHealth);
  router.use('/auth', authRoutes);

  // Protect everything below with auth middleware
  router.use(authMiddleware);

  // Protected product CRUD routes
  router.get('/api/products', listProducts);
  router.get('/api/products/:id', getProduct);
  router.post('/api/products', createProduct);
  router.put('/api/products/:id', updateProduct);
  router.delete('/api/products/:id', deleteProduct);

  // Mount the router at root
  app.use('/', router);
}

module.exports = { applyRoutes };

