import React from 'react';
import InventorySummary from '../../components/InventorySummary/InventorySummary';
import BarcodeButton from '../../components/BarcodeButton/BarcodeButton';
import './Inventory.css';

const Inventory = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-row">
        <div className="summary-wrapper">
          <InventorySummary />
        </div>
        <div className="barcode-wrapper">
          <BarcodeButton />
        </div>
      </div>
    </div>
  );
};

export default Inventory;
