import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from '../store';
import { Link } from 'react-router-dom';

const Cart = () => {
  const dispatch = useDispatch();
  const cartProducts = useSelector((state) => state.cart);

  useEffect(() => {
        dispatch(actions.getCartProducts());
  }, [dispatch]);

  const handleDeleteCartProduct = (id) => {
    dispatch(actions.deleteProductFromCart(id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      <h1 className="text-xl font-bold text-gray-900 mb-4">Cart</h1>

      {!cartProducts || cartProducts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-gray-700">
          Your cart is empty.
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cartProducts.map((product) => (
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
                <Link
                  to={`/product/${product.id}`}
                  className="block truncate font-semibold text-gray-900 hover:text-gray-700"
                >
                  {product.title}
                </Link>

                <p className="mt-2 text-xs font-semibold text-gray-600">
                  {product.category}
                </p>

                <p className="mt-2 text-sm text-gray-700 overflow-hidden max-h-20">
                  {product.description}
                </p>

                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-bold text-gray-900">
                    Rs{product.price}
                  </p>
                  <p className="text-xs font-semibold text-gray-600">
                    rating: {product.rating?.rate}
                  </p>
                </div>

                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => handleDeleteCartProduct(product.id)}
                    className="px-3 py-2 rounded-md border border-red-200 text-red-600 text-sm hover:bg-red-50"
                    aria-label="Remove from cart"
                  >
                    <i className="fa-regular fa-trash-can"></i>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Cart;