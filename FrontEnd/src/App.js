import React, { Suspense, lazy } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';

const HomePage = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const Layout = lazy(() => import('./pages/Layout'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout></Layout>,
    children: [
      { 
        path: '/',
        element: <HomePage></HomePage>
      },
      {
        path: '/product',
        element: <Product></Product>
      },
      {
        path: '/product/:id',
        element: <ProductDetailPage></ProductDetailPage>
      },
      {
        path: '/Add-product',
        element: <AddProduct></AddProduct>
      },
      {
        path: '/cart',
        element: <Cart></Cart>
      }
    ]
  }
]);

function App() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading page...</div>}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
