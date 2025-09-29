import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import "./SupplierPerformance.css";

const SupplierPerformance = ({ data }) => {
  return (
    <div className="spu-container">
      <h4 className="spu-title">Supplier Performance Overview</h4>
      <p className="spu-subtitle">Showing data of top five suppliers</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="supplier" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="2020" fill="#6a5acd" />
          <Bar dataKey="2021" fill="#ffa500" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SupplierPerformance;
