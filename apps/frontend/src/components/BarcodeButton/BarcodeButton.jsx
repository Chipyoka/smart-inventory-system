import React, { useState } from 'react';
import { FaBarcode } from 'react-icons/fa';
import { useUserStore } from '../../store/userStore';
import ScanningActions from '../ScanningActions/ScanningActions';
import './BarcodeButton.css';

const BarcodeButton = () => {
  const { role } = useUserStore(state => state.user);
  const [open, setOpen] = useState(false);

  if (!['admin', 'manager'].includes(role)) return null;

  return (
    <div className="bb-unique-container">
      <button className="bb-unique-btn" onClick={() => setOpen(true)}>
        <div className="bb-unique-label">Scan New Item</div>
        <FaBarcode className="bb-unique-icon" />
      </button>
      {open && <ScanningActions onClose={() => setOpen(false)} />}
    </div>
  );
};

export default BarcodeButton;
