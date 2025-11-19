import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from '../store';


const Navbar = () => {
  const cart = useSelector((state) => state.cartItems);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.getCartValue());
  }, [])

  return (
    <div className="navbar">

      <div className="navbar-left">
        <Link to="/">E-commerce</Link>
        <Link to="/Add-product">Add Product</Link>
      </div>

      <div className="navbar-right">
        <Link to="/cart">
           <i className="fa-solid fa-cart-shopping"></i>
        </Link>
        <span className="cart-value">{`(${cart})`}</span>
      </div>

    </div>
  );
}

export default Navbar;
