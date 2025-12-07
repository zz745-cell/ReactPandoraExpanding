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
const firebaseUserRoutes = require('./firebase.routes');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireAccess } = require('../middleware/requireAccess');

// In a larger app, you'd import sub-routers here, e.g.:
// const productsRoutes = require('./products.routes');

function applyRoutes(app) {
  const router = express.Router();

  // Public routes (no token required)
  router.get('/', getHealth);
  router.use('/auth', authRoutes);
  router.use('/auth/users', authMiddleware, firebaseUserRoutes);

  // Protect everything below with auth middleware
  router.use(authMiddleware);

  // Protected product CRUD routes
  // Read routes: "products:read"
  router.get('/api/products', requireAccess('products', 'read'), listProducts);
  router.get('/api/products/:id', requireAccess('products', 'read'), getProduct);

  // Write routes: "products:write"
  router.post('/api/products', requireAccess('products', 'write'), createProduct);
  router.put('/api/products/:id', requireAccess('products', 'write'), updateProduct);
  router.delete('/api/products/:id', requireAccess('products', 'write'), deleteProduct);

  // Mount the router at root
  app.use('/', router);
}

module.exports = { applyRoutes };

