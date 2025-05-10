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
            <span className="logo-name font-16">Natural </span>
            <img alt="logo" src="/assets/img/natural_farmz_logo.png" style={{ borderRadius:'100px', width: '50px', height:'50px' }} className="header-logo" />
            <span className="logo-name font-16"> Farmz</span>
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

          <li className="dropdown">
            <a href="#" className="menu-toggle nav-link has-dropdown">
              <i className="fa fa-sliders"></i><span>Settings</span>
            </a>
            <ul className="dropdown-menu">
              <li><Link className={`nav-link ${isActive('/about')}`} to="/about">About</Link></li>
              <li><Link className={`nav-link ${isActive('/social-media')}`} to="/social-media">Social Media</Link></li>
              <li><Link className={`nav-link ${isActive('/seo')}`} to="/seo">SEO</Link></li>
              <li><Link className={`nav-link ${isActive('/smtp')}`} to="/smtp">SMTP</Link></li>
              <li><Link className={`nav-link ${isActive('/newsletter')}`} to="/newsletter">Newsletter</Link></li>
              <li><Link className={`nav-link ${isActive('/pages')}`} to="/pages">Website Pages</Link></li>
            </ul>
          </li>
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;
