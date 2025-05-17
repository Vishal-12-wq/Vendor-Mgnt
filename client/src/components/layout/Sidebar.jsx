import React from 'react';
import { Link, useLocation  } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path) => currentPath === path ? 'active' : '';

  return (
    <div className="main-sidebar sidebar-style-2">
      <aside id="sidebar-wrapper">
        <div className="sidebar-brand">
          <Link to="/Dashboard">
            {/* <span className="logo-name font-16"> </span> */}
            <img alt="logo" src="/assets/img/mainlogo.png" style={{  width: '50px', height:'50px' }} className="header-logo" />
            {/* <span className="logo-name font-16"> Farmz</span> */}
          </Link>
        </div>
        <ul className="sidebar-menu">
          <li className="menu-header">Main</li>

          <li className={`dropdown ${isActive('/Dashboard')}`}>
            <Link to="/Dashboard" className="nav-link">
              <i className="fa fa-home"></i><span>DASHBOARD</span>
            </Link>
          </li>

          <li className={`dropdown ${isActive('/Category')}`}>
            <Link to="/Category" className="nav-link">
              <i className="fa fa-layer-group"></i><span>CATEGORY</span>
            </Link>
          </li>

          <li className={`dropdown ${isActive('/SubCategory')}`}>
            <Link to="/SubCategory" className="nav-link">
              <i className="fa-solid fa-list-ul"></i><span>SUB CATEGORY</span>
            </Link>
          </li>

          <li className={`dropdown ${isActive('/Vendor')}`}>
            <Link to="/Vendor" className="nav-link">
              <i className="fa-solid fa-user-tie"></i><span>VENDOR</span>
            </Link>
          </li>


          <li className={`dropdown ${isActive('/Product')}`}>
            <Link to="/Product" className="nav-link">
              <i className="fa-brands fa-product-hunt"></i><span>PRODUCT</span>
            </Link>
          </li>

          <li className={`dropdown ${isActive('/OrderHistory')}`}>
            <Link to="/OrderHistory" className="nav-link">
              <i className="fa fa-history"></i><span>Order History</span>
            </Link>
          </li>

          <li className={`dropdown ${isActive('/Coupon')}`}>
            <Link to="/Coupon" className="nav-link">
              <i className="fa fa-ticket"></i><span>Coupon</span>
            </Link>
          </li>

          <li className={`dropdown ${isActive('/Banner')}`}>
            <Link to="/Banner" className="nav-link">
              <i className="fa fa-image"></i><span>Banner</span>
            </Link>
          </li>

          <li className={`dropdown ${isActive('/UserManagement')}`}>
            <Link to="/UserManagement" className="nav-link">
              <i className="fa fa-user"></i><span>User Management</span>
            </Link>
          </li>

        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
