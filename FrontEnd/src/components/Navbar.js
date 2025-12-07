import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from '../store';
import { isAdmin } from '../utils/auth';
import { firebaseLogout } from '../utils/firebaseAuth';


const Navbar = () => {
  const cart = useSelector((state) => state.cartItems);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(actions.getCartValue());
  }, [dispatch])

  const handleLogout = async () => {
    await firebaseLogout();
    navigate('/login');
  };

  return (
    <header className="w-full bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <nav className="flex items-center gap-4">
          <Link to="/" className="font-semibold text-gray-900 hover:text-gray-700">
            E-commerce
          </Link>
          {isAdmin() && (
            <Link
              to="/Add-product"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Add Product
            </Link>
          )}
          {isAdmin() && (
            <Link
              to="/admin/users"
              className="text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Users
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" className="text-gray-800 hover:text-gray-600">
            <i className="fa-solid fa-cart-shopping"></i>
          </Link>
          <span className="text-sm font-semibold text-gray-800">{`(${cart})`}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-2 rounded-md text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
