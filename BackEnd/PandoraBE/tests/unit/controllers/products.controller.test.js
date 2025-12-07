const { createMockReqResNext } = require('../../helpers/mockReqResNext');

jest.mock('../../../src/models/product.model', () => ({
  getAllProductsAsync: jest.fn(),
  getProductByIdAsync: jest.fn(),
  createProductAsync: jest.fn(),
  updateProductAsync: jest.fn(),
  deleteProductAsync: jest.fn(),
}));

const {
  getAllProductsAsync,
  getProductByIdAsync,
  createProductAsync,
  updateProductAsync,
  deleteProductAsync,
} = require('../../../src/models/product.model');

const {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../../../src/controllers/products.controller');

describe('products.controller', () => {
  test('listProducts returns all products', async () => {
    getAllProductsAsync.mockResolvedValue([
      { id: 1, name: 'Product 1' },
    ]);

    const { req, res } = createMockReqResNext();

    await listProducts(req, res);

    expect(getAllProductsAsync).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith([
      { id: 1, name: 'Product 1' },
    ]);
  });

  test('getProduct returns 404 when product not found', async () => {
    getProductByIdAsync.mockResolvedValue(null);

    const { req, res } = createMockReqResNext();
    req.params = { id: '999' };

    await getProduct(req, res);

    expect(getProductByIdAsync).toHaveBeenCalledWith(999);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
  });

  test('getProduct returns product when found', async () => {
    getProductByIdAsync.mockResolvedValue({ id: 2, name: 'Found' });

    const { req, res } = createMockReqResNext();
    req.params = { id: '2' };

    await getProduct(req, res);

    expect(res.json).toHaveBeenCalledWith({ id: 2, name: 'Found' });
  });

  test('createProduct returns 400 when name missing', async () => {
    const { req, res } = createMockReqResNext({
      body: { price: 10 },
    });

    await createProduct(req, res);

    expect(createProductAsync).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Name is required' });
  });

  test('createProduct returns 201 and created product', async () => {
    createProductAsync.mockResolvedValue({
      id: 3,
      name: 'New',
      price: 5,
      description: '',
    });

    const { req, res } = createMockReqResNext({
      body: { name: 'New', price: 5 },
    });

    await createProduct(req, res);

    expect(createProductAsync).toHaveBeenCalledWith({
      name: 'New',
      price: 5,
      description: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 3,
      name: 'New',
      price: 5,
      description: '',
    });
  });

  test('updateProduct returns 404 when product not found', async () => {
    updateProductAsync.mockResolvedValue(null);

    const { req, res } = createMockReqResNext({
      body: { name: 'Update' },
    });
    req.params = { id: '10' };

    await updateProduct(req, res);

    expect(updateProductAsync).toHaveBeenCalledWith(10, {
      name: 'Update',
      price: undefined,
      description: undefined,
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Product not found' });
  });

  test('deleteProduct returns 204 when deleted', async () => {
    deleteProductAsync.mockResolvedValue(true);

    const { req, res } = createMockReqResNext();
    req.params = { id: '4' };
    res.send = jest.fn(() => res);

    await deleteProduct(req, res);

    expect(deleteProductAsync).toHaveBeenCalledWith(4);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledTimes(1);
  });
});


