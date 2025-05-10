import React, { useEffect, useState } from 'react';
import axios from '../../api/axiosConfig';
import { Link, useLocation  } from 'react-router-dom';

const Dashboard = () => {

const [categoryCount, setCategoryCount] = useState(0);
const [subCategoryCount, setSubCategoryCount] = useState(0);
const [productCount, setProductCount] = useState(0);
const [vendorCount, setVendorCount] = useState(0);

// Fetch and count categories
const fetchCategoryCount = async () => {
  try {
    const res = await axios.get('/categories');
    setCategoryCount(res.data.data.length);
  } catch (err) {
    console.error('Error fetching categories:', err);
  }
};

// Fetch and count subcategories
const fetchSubCategories = async () => {
  try {
    const res = await axios.get('/subcategories');
    setSubCategoryCount(res.data.data.length);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
  }
};

// Fetch and count products
const fetchProducts = async () => {
  try {
    const res = await axios.get('/products');
    setProductCount(res.data.data.length);
  } catch (err) {
    console.error('Error fetching products:', err);
  }
};

// Fetch and count vendors
const fetchVendorCount = async () => {
  try {
    const res = await axios.get('/vendors'); // Correct endpoint here
    setVendorCount(res.data.data.length);
  } catch (err) {
    console.error('Error fetching vendors:', err);
  }
};

useEffect(() => {
  fetchCategoryCount();
  fetchSubCategories();
  fetchProducts();
  fetchVendorCount();
}, []);







  
  return (
    
    <>
      <div className="row ">
        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-xs-12">
          <div className="card">
            <div className="card-statistic-4">
              <div className="align-items-center justify-content-between">
                <div className="row ">
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pr-0 pt-3">
                    <div className="card-content">
                      <h5 className="font-15">Category</h5>
                      <h2 className="mb-3 font-18">{categoryCount}</h2>
                      <p className="mb-0"><Link to='/Category' className="col-green">View</Link></p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pl-0">
                    <div className="banner-img">
                      <img src="assets/img/banner/1.png" alt=""/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-xs-12">
          <div className="card">
            <div className="card-statistic-4">
              <div className="align-items-center justify-content-between">
                <div className="row ">
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pr-0 pt-3">
                    <div className="card-content">
                      <h5 className="font-15"> Sub Category</h5>
                      <h2 className="mb-3 font-18">{subCategoryCount}</h2>
                      <p className="mb-0"><Link to="/SubCategory" className="col-green">View</Link></p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pl-0">
                    <div className="banner-img">
                      <img src="assets/img/banner/2.png" alt=""/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-xs-12">
          <div className="card">
            <div className="card-statistic-4">
              <div className="align-items-center justify-content-between">
                <div className="row ">
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pr-0 pt-3">
                    <div className="card-content">
                      <h5 className="font-15">Products</h5>
                      <h2 className="mb-3 font-18">{productCount}</h2>
                      <p className="mb-0"><Link to="/Product" className="col-green">View</Link></p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pl-0">
                    <div className="banner-img">
                      <img src="assets/img/banner/3.png" alt=""/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-xs-12">
          <div className="card">
            <div className="card-statistic-4">
              <div className="align-items-center justify-content-between">
                <div className="row ">
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pr-0 pt-3">
                    <div className="card-content">
                      <h5 className="font-15">Vendors</h5>
                      <h2 className="mb-3 font-18">{vendorCount}</h2>
                      <p className="mb-0"><Link to="/Vendor" className="col-green">View</Link></p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 pl-0">
                    <div className="banner-img">
                      <img src="assets/img/banner/4.png" alt=""/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
