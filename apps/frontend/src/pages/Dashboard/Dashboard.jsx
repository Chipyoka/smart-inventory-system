import React from 'react';
import './Dashboard.css';
import InventorySummary from '../../components/InventorySummary/InventorySummary';
import BarcodeButton from '../../components/BarcodeButton/BarcodeButton';

const Dashboard = () => {
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

export default Dashboard;
