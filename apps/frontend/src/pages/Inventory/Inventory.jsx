import React from 'react';
import InventorySummary from '../../components/InventorySummary/InventorySummary';
import BarcodeButton from '../../components/BarcodeButton/BarcodeButton';
import StockedProducts from '../../components/StockedProducts/StockedProducts';
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
      <div className="stocked-products-wrapper">
        <StockedProducts />
      </div>
    </div>
  );
};

export default Inventory;
