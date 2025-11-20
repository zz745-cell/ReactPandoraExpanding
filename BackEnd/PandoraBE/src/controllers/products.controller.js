const {
  getAllProductsAsync,
  getProductByIdAsync,
  createProductAsync,
  updateProductAsync,
  deleteProductAsync,
} = require('../models/product.model');

async function listProducts(req, res) {
  const items = await getAllProductsAsync();
  res.json(items);
}

async function getProduct(req, res) {
  const id = Number(req.params.id);
  const product = await getProductByIdAsync(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.json(product);
}

async function createProductHandler(req, res) {
  const { name, price, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const product = await createProductAsync({ name, price, description });
  return res.status(201).json(product);
}

async function updateProductHandler(req, res) {
  const id = Number(req.params.id);
  const { name, price, description } = req.body;

  const updated = await updateProductAsync(id, { name, price, description });
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.json(updated);
}

async function deleteProductHandler(req, res) {
  const id = Number(req.params.id);
  const deleted = await deleteProductAsync(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  return res.status(204).send();
}

module.exports = {
  listProducts,
  getProduct,
  createProduct: createProductHandler,
  updateProduct: updateProductHandler,
  deleteProduct: deleteProductHandler,
};

