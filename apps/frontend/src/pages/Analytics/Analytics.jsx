import React from 'react';
import InventorySummary from '../../components/InventorySummary/InventorySummary';
import ReportButton from '../../components/ReportButton/ReportButton';
import { useUserStore } from '../../store/userStore';
import './Analytics.css';

const Analytics = () => {
  return (
    <div className="analytics-page">
      <div className="dashboard-row">
        <div className="summary-wrapper">
          <InventorySummary />
        </div>
        <div className="barcode-wrapper">
          <ReportButton />
        </div>
      </div>
      {/* <div className="stocked-products-wrapper">
        <StockedProducts />
      </div> */}
    </div>

  );
};

export default Analytics;
