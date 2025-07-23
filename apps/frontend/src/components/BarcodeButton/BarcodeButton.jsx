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
    <div className="barcode-button-container">
      <button className="barcode-btn" onClick={() => setOpen(true)}>
        <div className="barcode-label">Scan New Item</div>
        <FaBarcode className="barcode-icon" />
      </button>
      {open && <ScanningActions onClose={() => setOpen(false)} />}
    </div>
  );
};

export default BarcodeButton;
