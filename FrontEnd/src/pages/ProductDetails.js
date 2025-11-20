import React, { useState, useEffect, useDebugValue } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { actions } from '../store';

const ProductDetailPage = () => {
  const { id } = useParams();
  //const [product, setProduct] = useState(null);
  const dispatch = useDispatch();
  const product = useSelector((state) => state.productDetails)
console.log(product)
  useEffect(() => {
    const fetchProduct = async () => {
      dispatch(actions.getProductDetails(id));
      //setProduct(productData);
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = (product) => {
    // handle adding to cart logic
    dispatch(actions.addToCart(product));
  };

  if (!product) {
    return <div>Loading...</div>;
  }

  const { title, description, image, price, quantity, reviews, rating } = product;

  return (
    // <div className="product-detail-page">
    //   <div className="product-detail-container">
    //     <ProductImage image={image} />
    //     <ProductDescription name={name} description={description} price={price} rating={rating} />
    //     <ProductAddToCart product={product} />
    //   </div>
    //   <ProductReviews reviews={reviews} />
    // </div>
    <div className="product-detail-container">
        <div className="product-image-container">
            <img src={image} alt="Product" />
        </div>
        <div className="product-info-container">
            <h1>{title}</h1>
            <p className="product-description"> {description} </p>
            <div className="product-price">
                Rs{price}
            </div>
            <button className="add-to-cart-button" onClick={() => handleAddToCart(product)}>Add to Cart</button>
        </div>
    </div>
  );
};

export default ProductDetailPage;
