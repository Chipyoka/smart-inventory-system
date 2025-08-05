import React from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import "./SupplierPerformance.css";

const SupplierPerformance = ({ data }) => {
  return (
    <div className="supplier-performance">
      <h4>Supplier Performance Overview</h4>
      <p>Showing data of top five suppliers</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="supplier" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="2020" fill="#8884d8" />
          <Bar dataKey="2021" fill="#ffc658" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SupplierPerformance;
