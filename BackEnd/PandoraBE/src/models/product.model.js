// In-memory product "database"
let products = [
  { id: 1, name: 'Sample product from backend', price: 9.99 },
];

let nextId = 2;

function getAllProducts() {
  return products;
}

function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

function createProduct(data) {
  const product = {
    id: nextId++,
    name: data.name,
    price: data.price ?? 0,
    description: data.description ?? '',
  };
  products.push(product);
  return product;
}

function updateProduct(id, data) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return null;

  products[idx] = {
    ...products[idx],
    ...data,
    id, // ensure id is not changed
  };

  return products[idx];
}

function deleteProduct(id) {
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return false;
  products.splice(idx, 1);
  return true;
}

// Async-style wrappers so callers can treat this like a real DB
function getAllProductsAsync() {
  return Promise.resolve().then(() => getAllProducts());
}

function getProductByIdAsync(id) {
  return Promise.resolve().then(() => getProductById(id));
}

function createProductAsync(data) {
  return Promise.resolve().then(() => createProduct(data));
}

function updateProductAsync(id, data) {
  return Promise.resolve().then(() => updateProduct(id, data));
}

function deleteProductAsync(id) {
  return Promise.resolve().then(() => deleteProduct(id));
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProductsAsync,
  getProductByIdAsync,
  createProductAsync,
  updateProductAsync,
  deleteProductAsync,
};


