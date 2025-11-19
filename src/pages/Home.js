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
    //console.log(editProductValue);
    dispatch(updateProduct(id, editProductValue));
    setEditingProduct(null);
    setEditProductValue(null);
  };

  // set the edit state to remove the edit fields
  const handleCancleProduct = (product) => {
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
    <>
      <div className="product-sort-container">
        <div className="product-search">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className='product-sort'>
          <button type="button" onClick={handleRefresh}>
            Refresh
          </button>
          <div className="sort-segment-group">
            <button
              type="button"
              className={`sort-segment ${sort.field === 'price' && sort.direction === 'asc' ? 'active' : ''}`}
              onClick={handleSortByPriceAsc}
            >
              Price ↑
            </button>
            <button
              type="button"
              className={`sort-segment ${sort.field === 'price' && sort.direction === 'desc' ? 'active' : ''}`}
              onClick={handleSortByPriceDesc}
            >
              Price ↓
            </button>
            <button
              type="button"
              className={`sort-segment ${sort.field === 'description' ? 'active' : ''}`}
              onClick={handleSortByDescription}
            >
              Description
            </button>
          </div>
        </div>
      </div>
      <div className={`product-list ${isLoading ? 'is-loading' : ''}`}>
      {isLoading ? (
        <div className="product-list-loading">
          <div className="spinner" />
        </div>
      ) : (
      <ul>
        {filteredProducts.map((product) => (
          <li key={product.id} className="product">
            <img src={product.image} alt={product.title} />
            <div className="product-info">
            {/* title */}
            {editingProduct === product ? (
              <input
              type="text"
              className="form-input"
              value={editProductValue.title}
              onChange={(e) => {
                  const newProduct = { ...editProductValue };
                  newProduct.title = e.target.value;
                  //handleUpdateProduct(product.id, newProduct);
                  setEditProductValue(newProduct);
                }}
              />
            ) : (
              <Link to={`/product/${product.id}`}>
                <h3>{product.title}</h3>
              </Link>
            )}

            {/* category */}
            {editingProduct === product ? (
              <input
                type="text"
                className="form-input"
                value={editProductValue.category}
                onChange={(e) => {
                  const newProduct = { ...editProductValue };
                  newProduct.category = e.target.value;
                  //handleUpdateProduct(product.id, newProduct);
                  setEditProductValue(newProduct);
                }}
              />
            ) : (
              <p className="price">{product.category}</p>
            )}

            {/* description */}
            {editingProduct === product ? (
              <textarea
                className="form-input"
                value={editProductValue.description}
                onChange={(e) => {
                  const newProduct = { ...editProductValue };
                  newProduct.description = e.target.value;
                  //handleUpdateProduct(product.id, newProduct);
                  setEditProductValue(newProduct);
                }}
              ></textarea>
            ) : (
              <p>{product.description}</p>
            )}

            {/* price */}
            {editingProduct === product ? (
              <input
                type="text"
                value={editProductValue.price}
                onChange={(e) => {
                  const newProduct = { ...editProductValue };
                  newProduct.price = e.target.value;
                  //handleUpdateProduct(product.id, newProduct);
                  setEditProductValue(newProduct);
                }}
              />
            ) : (
              <p className="price">Rs{product.price}</p>
            )}

            {/* rating */}
            {editingProduct === product ? (
              <input
              type="text"
                value={editProductValue.rating.rate}
                onChange={(e) => {
                  const newProduct = { ...editProductValue };
                  console.log(newProduct);
                  newProduct.rating = {
                    ...newProduct.rating,
                    rate: e.target.value
                  };
                  setEditProductValue(newProduct);
                  //handleUpdateProduct(product.id, newProduct);
                }}
                />
                ) : (
                  <p className="price">rating: {product.rating.rate}</p>
                  )}  
  
            {editingProduct === product ? (<>
                        <button onClick={() => handleCancleProduct()}>
                          cancle
                        </button>

                        <button onClick={(e) => handleUpdateProduct(product.id)}>
                          update
                        </button>
                   </>
              ) : (
              <>
                  <button onClick={() => handleAddToCart(product)}>
                      Add To Cart
                  </button>
                  <button onClick={() => handleEditProduct(product)}>
                    <i className="fa-regular fa-pen-to-square"></i>
                  </button>

                  <button onClick={() => handleDeleteProduct(product.id)}>
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
              </>
            )}
            </div>
        </li>
        ))}
        </ul>
      )}
      </div>
    </>
  )
}

export default Home;