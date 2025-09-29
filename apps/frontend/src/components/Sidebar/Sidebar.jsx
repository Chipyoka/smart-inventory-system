import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Sidebar.css';
import { useUserStore } from '../../store/userStore';
import { FaTachometerAlt, FaBoxes, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

const SidebarUnique = () => {
  const navigate = useNavigate();
  const logout = useUserStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sb-unique-sidebar">
      <div className="sb-unique-inner">
        {/* Navigation Links */}
        <nav className="sb-unique-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? 'sb-unique-link sb-unique-active' : 'sb-unique-link'
            }
          >
            <FaTachometerAlt className="sb-unique-icon" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              isActive ? 'sb-unique-link sb-unique-active' : 'sb-unique-link'
            }
          >
            <FaBoxes className="sb-unique-icon" />
            <span>Inventory</span>
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              isActive ? 'sb-unique-link sb-unique-active' : 'sb-unique-link'
            }
          >
            <FaChartBar className="sb-unique-icon" />
            <span>Analytics</span>
          </NavLink>
        </nav>

        {/* Footer */}
        <div className="sb-unique-footer">
          <button
            type="button"
            className="sb-unique-logout-btn"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="sb-unique-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default SidebarUnique;
