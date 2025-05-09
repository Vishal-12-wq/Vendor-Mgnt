import React from 'react';

const Header = () => {
  return (
    <>
      <div className="navbar-bg"></div>
      <nav className="navbar navbar-expand-lg main-navbar sticky">
        <div className="form-inline mr-auto">
          <ul className="navbar-nav mr-3">
            <li><a href="#" data-toggle="sidebar" className="nav-link nav-link-lg font-bold collapse-btn"><i className="fas fa-align-justify font-bold"></i>
            </a></li>
            <li><a href="#" className="nav-link nav-link-lg font-bold fullscreen-btn"><i className="fa fa-expand"></i></a></li>
          </ul>
        </div>
        <ul className="navbar-nav navbar-right">
          <li className="dropdown">
            <a href="#" data-toggle="dropdown" className="nav-link dropdown-toggle nav-link-lg nav-link-user">
              <img alt="user" src="assets/img/user.png" className="user-img-radious-style" />
              <span className="d-sm-none d-lg-inline-block"></span>
            </a>
            <div className="dropdown-menu dropdown-menu-right pullDown">
              <div className="dropdown-title">John Doe</div>
              <a href="/profile" className="dropdown-item has-icon"><i className="fa-solid fa-user"></i> Profile</a>
              <div className="dropdown-divider"></div>
              <a href="/Login" className="dropdown-item has-icon text-danger"><i className="fas fa-sign-out-alt"></i> Logout</a>
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Header;
