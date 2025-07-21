import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useUserStore } from '../../store/userStore';
import { FaTachometerAlt, FaBoxes, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const logout = useUserStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-inner">
        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            <FaTachometerAlt className="sidebar-icon" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/inventory"
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            <FaBoxes className="sidebar-icon" />
            <span>Inventory</span>
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) => (isActive ? 'sidebar-link active' : 'sidebar-link')}
          >
            <FaChartBar className="sidebar-icon" />
            <span>Analytics</span>
          </NavLink>
        </nav>

        {/* Logout at bottom */}
        <div className="sidebar-footer">
          <button
            type="button"
            className="sidebar-logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="sidebar-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
