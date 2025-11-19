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
  const [errors, setErrors] = useState([]);
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
    console.log(newErrors);
    if (JSON.stringify(newErrors) === "{}") {
      // Make API call or dispatch Redux action to save the product
      console.log('Product data:', productData);
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
    <form onSubmit={handleSubmit} className='form-container'>
      <label className="form-label">
        title:
      </label>
      <input type="text" name="title" value={productData.title} onChange={handleChange} className="form-input"/>
      {errors.title && <p className="form-error">{errors.title}</p>}

      <label className="form-label">
        Category:
      </label>
        <input type="text" name="category" value={productData.category} onChange={handleChange} className="form-input"/>
        {errors.category && <p className="form-error">{errors.category}</p>}

      <label className="form-label">
        Description:
      </label>
        <textarea name="description" value={productData.description} onChange={handleChange} className="form-input"></textarea>
        {errors.description && <p className="form-error">{errors.description}</p>}

      <label className="form-label">
        Image:
      </label>
        <input type="text" name="image" value={productData.image} onChange={handleChange} className="form-input"/>
        {errors.image && <p className="form-error">{errors.image}</p>}

      <label className="form-label">
        Price:
      </label>
        <input type="number" name="price" value={productData.price} onChange={handleChange} className="form-input"/>
        {errors.price && <p className="form-error">{errors.price}</p>}
      {/* <label>
        Quantity:
        <input type="n" name="quantity" value={productData.quantity} onChange={handleChange} />
      </label> */}
      <label className="form-label">
        Count:
      </label>
        <input type="number" name="count" value={productData.count} onChange={handleChange} className="form-input"/>
        {errors.count && <p className="form-error">{errors.count}</p>}

      <label className="form-label">
        Rate:
      </label>
        <input type="number" name="rate" value={productData.rate} onChange={handleChange} className="form-input"/>
        {errors.rate && <p className="form-error">{errors.rate}</p>}

      <button type="submit" className="form-button">Submit</button>
    </form>
  );
}

export default AddProduct;

  
