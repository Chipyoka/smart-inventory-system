import React, { useEffect, useState } from "react";
import API from "../../api/axiosInstance";
import "./inventorySummary.css";

const InventorySummary = () => {
  const [summary, setSummary] = useState({
    totalItems: 0,
    newlyStocked: 0,
    expired: 0,
    outOfStock: 0,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await API.get("/inventory/summary");
        setSummary(res.data);
      } catch (error) {
        console.error("Error fetching inventory summary:", error);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="inventory-summary-container">
      <h2>Inventory Summary</h2>
      <div className="summary-cards">
        <div className="summary-card total">
          <strong>{summary.totalItems}</strong>
          <span>Total Items</span>
        </div>
        <div className="summary-card stocked">
          <strong>{summary.newlyStocked}</strong>
          <span>Newly Stocked</span>
        </div>
        <div className="summary-card expired">
          <strong>{summary.expired}</strong>
          <span>Expired Products</span>
        </div>
        <div className="summary-card outofstock">
          <strong>{summary.outOfStock}</strong>
          <span>Out of Stock</span>
        </div>
      </div>
    </div>
  );
};

export default InventorySummary;
