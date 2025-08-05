import React from 'react';
import './Dashboard.css';

import InventorySummary from '../../components/InventorySummary/InventorySummary';
import BarcodeButton from '../../components/BarcodeButton/BarcodeButton';
import MostInDemand from '../../components/MostInDemand/MostInDemand';
import NotificationsCenter from '../../components/NotificationsCenter/NotificationsCenter';
import SupplierPerformance from '../../components/SupplierPerformance/SupplierPerformance';

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

      <div className="dashboard-row">
        <div className="mid-wrapper">
          <MostInDemand />
        </div>
        <div className="right-column">
          <NotificationsCenter />
          <SupplierPerformance />
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
