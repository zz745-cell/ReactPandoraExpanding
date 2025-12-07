import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { actions } from '../store';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const product = useSelector((state) => state.productDetails);

  useEffect(() => {
    dispatch(actions.getProductDetails(id));
  }, [dispatch, id]);

  const handleAddToCart = (product) => {
    // handle adding to cart logic
    dispatch(actions.addToCart(product));
  };

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="w-full flex justify-center py-10">
          <div className="h-6 w-6 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
        </div>
      </div>
    );
  }

  const { title, description, image, price } = product;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div className="flex items-center justify-center">
            <img
              src={image}
              alt={title}
              className="w-full max-w-md rounded-lg object-contain bg-gray-50"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-3 text-gray-700">{description}</p>

            <div className="mt-5 text-xl font-extrabold text-gray-900">
              Rs{price}
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="px-4 py-3 rounded-md bg-gray-900 text-white font-semibold hover:bg-gray-800"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
