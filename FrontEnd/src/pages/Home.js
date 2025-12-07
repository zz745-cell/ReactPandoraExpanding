import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, updateProduct, actions } from '../store';
import { Link } from 'react-router-dom';
import { selectSortedProducts } from '../selectors/products';

const Home = () => {
  // initilizing all variables and reducer functions
  const dispatch = useDispatch();
  const sort = useSelector((state) => state.sort); 
  const products = useSelector(selectSortedProducts);
  const isLoading = useSelector((state) => state.isLoading);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editProductValue, setEditProductValue] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {

    
    // only fetch from API if we don't already have products in state
    if (!products || products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products]);

  // changes the edit states to show edit inputs
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditProductValue(product);
  };

  // dispatches a updtae function to do changes in the database
  const handleUpdateProduct = (id) => {
    dispatch(updateProduct(id, editProductValue));
    setEditingProduct(null);
    setEditProductValue(null);
  };

  // set the edit state to remove the edit fields
  const handleCancleProduct = () => {
    setEditingProduct(null);
    setEditProductValue(null)
  };

  // dispatche tha ction to delte product from db
  const handleDeleteProduct = (id) => {
    dispatch(deleteProduct(id));
  };

  // sorts the products by price (asc) via API
  const handleSortByPriceAsc = () => {
    const sortConfig = { field: 'price', direction: 'asc' };
    dispatch(actions.setSort(sortConfig));
    dispatch(fetchProducts(sortConfig));
  };

  const handleSortByPriceDesc = () => {
    const sortConfig = { field: 'price', direction: 'desc' };
    dispatch(actions.setSort(sortConfig));
    dispatch(fetchProducts(sortConfig));
  };

  // sorts the products by description (asc) via API
  const handleSortByDescription = () => {
    const sortConfig = { field: 'description', direction: 'asc' };
    dispatch(actions.setSort(sortConfig));
    dispatch(fetchProducts(sortConfig));
  };

  // add the product to the cart
  const handleAddToCart = (product) => {
    // handle adding to cart logic
    dispatch(actions.addToCart(product));
  };

  const handleRefresh = () => {
    // re-fetch products from API using current sort config (handled in thunk)
    dispatch(fetchProducts());
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredProducts = products.filter((product) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      product.title?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      <div className="flex flex-col gap-3 items-end mb-4">
        <div className="w-full flex justify-start">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full sm:w-72 px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>

        <div className="w-full flex items-center justify-between">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-2 rounded-md border border-gray-300 bg-white text-sm hover:bg-gray-50"
          >
            Refresh
          </button>

          <div className="inline-flex rounded-full border border-gray-300 overflow-hidden bg-gray-50">
            <button
              type="button"
              className={`px-4 py-2 text-sm transition ${sort.field === 'price' && sort.direction === 'asc'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={handleSortByPriceAsc}
            >
              Price ↑
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm border-l border-gray-200 transition ${sort.field === 'price' && sort.direction === 'desc'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={handleSortByPriceDesc}
            >
              Price ↓
            </button>
            <button
              type="button"
              className={`px-4 py-2 text-sm border-l border-gray-200 transition ${sort.field === 'description'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
              onClick={handleSortByDescription}
            >
              Description
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="w-full flex justify-center py-10">
          <div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <li
              key={product.id}
              className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex gap-3 p-3"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-32 h-24 object-cover rounded-md bg-gray-100"
              />
              <div className="flex-1 min-w-0">
                {/* title */}
                {editingProduct === product ? (
                  <input
                    type="text"
                    value={editProductValue.title}
                    onChange={(e) => {
                      const newProduct = { ...editProductValue };
                      newProduct.title = e.target.value;
                      setEditProductValue(newProduct);
                    }}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  />
                ) : (
                  <Link
                    to={`/product/${product.id}`}
                    className="block truncate font-semibold text-gray-900 hover:text-gray-700"
                  >
                    {product.title}
                  </Link>
                )}

                {/* category */}
                <div className="mt-2">
                  {editingProduct === product ? (
                    <input
                      type="text"
                      value={editProductValue.category}
                      onChange={(e) => {
                        const newProduct = { ...editProductValue };
                        newProduct.category = e.target.value;
                        setEditProductValue(newProduct);
                      }}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  ) : (
                    <p className="text-xs font-semibold text-gray-600">
                      {product.category}
                    </p>
                  )}
                </div>

                {/* description */}
                <div className="mt-2">
                  {editingProduct === product ? (
                    <textarea
                      value={editProductValue.description}
                      onChange={(e) => {
                        const newProduct = { ...editProductValue };
                        newProduct.description = e.target.value;
                        setEditProductValue(newProduct);
                      }}
                      className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                      rows={3}
                    />
                  ) : (
                    <p className="text-sm text-gray-700 overflow-hidden max-h-20">
                      {product.description}
                    </p>
                  )}
                </div>

                {/* price + rating */}
                <div className="mt-2 flex items-center justify-between gap-2">
                  {editingProduct === product ? (
                    <input
                      type="text"
                      value={editProductValue.price}
                      onChange={(e) => {
                        const newProduct = { ...editProductValue };
                        newProduct.price = e.target.value;
                        setEditProductValue(newProduct);
                      }}
                      className="w-28 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  ) : (
                    <p className="text-sm font-bold text-gray-900">
                      Rs{product.price}
                    </p>
                  )}

                  {editingProduct === product ? (
                    <input
                      type="text"
                      value={editProductValue.rating.rate}
                      onChange={(e) => {
                        const newProduct = { ...editProductValue };
                        newProduct.rating = {
                          ...newProduct.rating,
                          rate: e.target.value,
                        };
                        setEditProductValue(newProduct);
                      }}
                      className="w-24 px-3 py-2 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                    />
                  ) : (
                    <p className="text-xs font-semibold text-gray-600">
                      rating: {product.rating.rate}
                    </p>
                  )}
                </div>

                {/* actions */}
                <div className="mt-3 flex items-center gap-2">
                  {editingProduct === product ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCancleProduct}
                        className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                      >
                        cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateProduct(product.id)}
                        className="px-3 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800"
                      >
                        update
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(product)}
                        className="px-3 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800"
                      >
                        Add To Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEditProduct(product)}
                        className="px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50"
                        aria-label="Edit product"
                      >
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50"
                        aria-label="Delete product"
                      >
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Home;