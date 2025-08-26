import React from "react";
import InventoryValueByCategory from "../Inventory/InventoryValueByCategory/InventoryValueByCategory";
import ExpiryRiskDonut from "../Inventory/ExpiryRiskDonut/ExpiryRiskDonut";
import StockStatusByCategory from "../Inventory/StockStatusByCategory/StockStatusByCategory";
import AuditActivityTrend from "../Inventory/AuditActivityTrend/AuditActivityTrend";
import "./InventoryAnalyticsGrid.css";

const InventoryAnalytics = () => {
  return (
    <div className="grid-analytics">
      <InventoryValueByCategory />
      <ExpiryRiskDonut />
      <StockStatusByCategory threshold={20} />
      <AuditActivityTrend />
    </div>
  );
};

export default InventoryAnalytics;
