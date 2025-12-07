import React, { Suspense, lazy } from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { requireAdmin } from './router/guards';

const HomePage = lazy(() => import('./pages/Home'));
const Product = lazy(() => import('./pages/Product'));
const AddProduct = lazy(() => import('./pages/AddProduct'));
const Layout = lazy(() => import('./pages/Layout'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetails'));
const Cart = lazy(() => import('./pages/Cart'));
const LoginPage = lazy(() => import('./pages/Login'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsers'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
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
        loader: requireAdmin,
        element: <AddProduct></AddProduct>
      },
      {
        path: '/admin/users',
        loader: requireAdmin,
        element: <AdminUsersPage></AdminUsersPage>
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
