import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct, updateProduct, actions } from '../store';
import { Link } from 'react-router-dom';

const Cart = () => {
  const dispatch = useDispatch();
  const cartProducts = useSelector((state) => state.cart);

  useEffect(() => {
        dispatch(actions.getCartProducts());
  }, []);

  const handleDeleteCartProduct = (id) => {
    dispatch(actions.deleteProductFromCart(id));
  };

  return (
    <div className="product-list">
      <ul>
        {cartProducts && cartProducts.map((product) => (
          <li key={product.id} className="product">
            <img src={product.image} alt={product.title} />
            <div className="product-info">
            {/* title */}
              <Link to={`/product/${product.id}`}>
                <h3>{product.title}</h3>
              </Link>

            {/* category */}
            <p className="price">{product.category}</p>

            {/* description */}
            <p>{product.description}</p>

            {/* price */}
            <p className="price">Rs{product.price}</p>

            {/* rating */}
            <p className="price">rating: {product.rating.rate}</p>
            
            {/* <div style={{display: "flex"}}>
                <button onClick={() => handleIncreaseQuantity(product)} style={{border: "none"}}>
                    <i className="fa-regular fa-square-plus"></i>
                </button>
                <p>{product.quantity}</p>
                <button onClick={() => handleDescreaseQuantity(product)} style={{border: "none"}}>
                    <i className="fa-regular fa-square-minus"></i>
                </button>
            </div> */}

            <button onClick={() => handleDeleteCartProduct(product.id)}>
            <i className="fa-regular fa-trash-can"></i>
            </button>
            </div>
        </li>
        ))}
        </ul>
    </div>
  )
}

export default Cart;