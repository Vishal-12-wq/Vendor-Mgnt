import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './components/pages/Dashboard';
import Category from './components/pages/Category';
import SubCategory from './components/pages/SubCategory';
import Vendor from './components/pages/Vendor';
import Login from './components/pages/Login';
import Product from './components/pages/Product';
import OrderHistory from './components/pages/OrderHistory';
import Coupon from './components/pages/Coupon';
import Banner from './components/pages/Banner';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route without layout */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected routes inside MainLayout */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/Dashboard" element={<Dashboard />} />
                <Route path="/Category" element={<Category />} />
                <Route path="/SubCategory" element={<SubCategory />} />
                <Route path="/Vendor" element={<Vendor />} />
                <Route path="/Product" element={<Product />} />
                <Route path="/OrderHistory" element={<OrderHistory />} />
                <Route path="/Coupon" element={<Coupon />} />
                <Route path="/Banner" element={<Banner />} />

              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
