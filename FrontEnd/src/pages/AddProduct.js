import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { addNewProduct } from '../store';

const AddProduct = () => {
  //initilixing the states
  const [productData, setProductData] = useState({
    title: '',
    category: '',
    description: '',
    image: '',
    price: '',
    count: '',
    rate: ''
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  // validates the submitted data and dispatches the action
  // to save product
  const handleSubmit = (event) => {
    event.preventDefault();
    // holds the errors
    let newErrors = {};
    // validating the data and adding errors to the newError object
    if (productData.title.trim() === "") {
      newErrors.title = "Title cannot be empty";
    }
    if (productData.category.trim() === "") {
      newErrors.category ="Category cannot be empty";
    }
    if (productData.description.trim() === "") {
      newErrors.description = "Description cannot be empty";
    }
    if (productData.image.trim() === "") {
      newErrors.image  =  "Image URL cannot be empty";
    }
    if (isNaN(productData.price) || productData.price <= 0) {
      newErrors.price = "Price should be a positive number";
    }
    if (isNaN(productData.count) || productData.count <= 0) {
      newErrors.count = "Count should be a positive number";
    }
    if (isNaN(productData.rate) || productData.rate <= 0) {
      newErrors.rate = "Rate should be a positive number";
    }

    setErrors(newErrors);
    if (JSON.stringify(newErrors) === "{}") {
      // Make API call or dispatch Redux action to save the product
      dispatch(addNewProduct(productData));
      setProductData({
        title: '',
        category: '',
        description: '',
        image: '',
        price: '',
        count: '',
        rate: ''
      })
    }

  }

  // maitains the input state changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setProductData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-900">Add Product</h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={productData.title}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Category
            </label>
            <input
              type="text"
              name="category"
              value={productData.category}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              name="description"
              value={productData.description}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              rows={4}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              value={productData.image}
              onChange={handleChange}
              className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Price
              </label>
              <input
                type="number"
                name="price"
                value={productData.price}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Count
              </label>
              <input
                type="number"
                name="count"
                value={productData.count}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              {errors.count && (
                <p className="mt-1 text-sm text-red-600">{errors.count}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700">
                Rate
              </label>
              <input
                type="number"
                name="rate"
                value={productData.rate}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 rounded-md border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10"
              />
              {errors.rate && (
                <p className="mt-1 text-sm text-red-600">{errors.rate}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full px-4 py-3 rounded-md bg-gray-900 text-white font-semibold hover:bg-gray-800"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddProduct;

  
