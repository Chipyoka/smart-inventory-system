import React, { useEffect, useState } from "react";
import API from "../../api/axiosInstance";
import "./InventorySummary.css";

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
    <div className="invSum-wrapper-uniq">
      <div className="invSum-container-uniq">
        <h2 className="invSum-title-uniq">Inventory Summary</h2>
        <div className="invSum-cards-uniq">
          <div className="invSum-card-uniq invSum-total-uniq">
            <strong>{summary.totalItems}</strong>
            <span>Total Items</span>
          </div>
          <div className="invSum-card-uniq invSum-stocked-uniq">
            <strong>{summary.newlyStocked}</strong>
            <span>Newly Stocked</span>
          </div>
          <div className="invSum-card-uniq invSum-expired-uniq">
            <strong>{summary.expired}</strong>
            <span>Expired Products</span>
          </div>
          <div className="invSum-card-uniq invSum-out-uniq">
            <strong>{summary.outOfStock}</strong>
            <span>Out of Stock</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventorySummary;
