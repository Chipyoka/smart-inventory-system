import React, { useEffect, useRef } from 'react';
import './SideMenu.css';
import { FaUserCog, FaCogs } from 'react-icons/fa';

const SideMenuUnique = ({ type, onClose }) => {
  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!type) return null;

  const renderContent = () => {
    if (type === 'profile') {
      return (
        <>
          <div className="sm-unique-header">
            <h3><FaUserCog /> Profile</h3>
            <button className="sm-unique-close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="sm-unique-content">
            <button>View Profile</button>
            <button>Edit Profile</button>
            <button>Change Password</button>
            <button>Logout</button>
          </div>
        </>
      );
    }

    if (type === 'settings') {
      return (
        <>
          <div className="sm-unique-header">
            <h3><FaCogs /> Settings</h3>
            <button className="sm-unique-close-btn" onClick={onClose}>&times;</button>
          </div>
          <div className="sm-unique-content">
            <button>Preferences</button>
            <button>System Config</button>
            <button>Theme</button>
            <button>About</button>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <div className="sm-unique-backdrop">
      <div className="sm-unique-menu" ref={menuRef}>
        {renderContent()}
      </div>
    </div>
  );
};

export default SideMenuUnique;
