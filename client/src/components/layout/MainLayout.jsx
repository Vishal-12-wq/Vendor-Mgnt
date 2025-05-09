import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="main-wrapper main-wrapper-1">
      <Header />
      <Sidebar />
      <div className="main-content">
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
