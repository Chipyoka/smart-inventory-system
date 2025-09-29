import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from '../Topbar/Topbar';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const Layout = () => {
  return (
    <div className="lyt-wrapper-unique">
      <Topbar />
      <div className="lyt-body-unique">
        <Sidebar />
        <main className="lyt-content-unique">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
