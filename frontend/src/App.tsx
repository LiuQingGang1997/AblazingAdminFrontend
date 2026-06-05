import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { App as AntdApp } from 'antd'
import AdminLayout from './layouts/AdminLayout'
import { RequireAuth } from './auth/RequireAuth'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Products from './pages/Products'
import Cases from './pages/Cases'
import Users from './pages/Users'
import Permissions from './pages/Permissions'
import Banners from './pages/Banners'
import CustomerReviews from './pages/CustomerReviews'
import Brands from './pages/Brands'
import MallBrands from './pages/MallBrands'
import ProductTypes from './pages/ProductTypes'
import ProductScenes from './pages/ProductScenes'

function App() {
  return (
    <AntdApp>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="banners" element={<Banners />} />
            <Route path="brands" element={<Brands />} />
            <Route path="customer-reviews" element={<CustomerReviews />} />
            <Route path="mall-brands" element={<MallBrands />} />
            <Route path="product-types" element={<ProductTypes />} />
            <Route path="product-scenes" element={<ProductScenes />} />
            <Route path="products" element={<Products />} />
            <Route path="cases" element={<Cases />} />
            <Route path="users" element={<Users />} />
            <Route path="permissions" element={<Permissions />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AntdApp>
  )
}

export default App
