import React, { useEffect, useState } from 'react';
import './Topbar.css';
import logo from '../../assets/logo.png';
import { useUserStore } from '../../store/userStore';
import { FaUserCog, FaCogs } from 'react-icons/fa';
import SideMenu from '../SideMenu/SideMenu';

const Topbar = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [menuType, setMenuType] = useState(null); // 'profile' or 'settings'
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const toggleMenu = (type) => setMenuType((prev) => (prev === type ? null : type));

  return (
    <>
      <header className="tb-container">
        <div className="tb-left">
          <img src={logo} alt="SIMS Logo" className="tb-logo" />
        </div>

        <div className="tb-right">
          <div className="tb-datetime">
            <div className="tb-datetime-label">Time & Date</div>
            <div className="tb-datetime-value">{formattedDate} | {formattedTime}</div>
          </div>

          <button className="tb-button" onClick={() => toggleMenu('profile')}>
            <FaUserCog className="tb-icon" />
            <span>{user?.username || 'Unknown User'}</span>
          </button>

          <button className="tb-button" onClick={() => toggleMenu('settings')}>
            <FaCogs className="tb-icon" title="System Settings" />
          </button>
        </div>
      </header>

      <SideMenu type={menuType} onClose={() => setMenuType(null)} />
    </>
  );
};

export default Topbar;
