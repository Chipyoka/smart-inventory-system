import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import "./StockStatusByCategory.css";

const StockStatusByCategory = ({ threshold = 20 }) => {
  const [data, setData] = useState([]);
  const [currentThreshold, setCurrentThreshold] = useState(threshold);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErr(null);

    axios.get(`/analytics/stock-status-by-category?threshold=${threshold}`, {
      signal: controller.signal
    })
      .then(res => {
        if (res.data?.data) {
          setData(res.data.data);
          setCurrentThreshold(res.data.threshold ?? threshold);
        } else {
          setData([]);
        }
      })
      .catch(e => {
        if (!controller.signal.aborted) {
          setErr(e.response?.data?.message || e.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [threshold]);

  return (
    <div className="ssbc-card analytics-card" role="img" aria-label="Stock Status by Category chart">
      <div className="card-header">
        <h3>Stock Status by Category</h3>
        <div className="card-sub">Low threshold: {currentThreshold}</div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="loader" aria-busy="true">Loading…</div>
        ) : err ? (
          <div className="error">{err}</div>
        ) : data.length === 0 ? (
          <div className="empty">No data available</div>
        ) : (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={data} margin={{ top: 12, right: 16, bottom: 24, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                <XAxis dataKey="category" tick={{ fill: "#374151", fontSize: 12 }} />
                <YAxis tick={{ fill: "#374151", fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [`${value}`, name]}
                  cursor={{ fill: "rgba(99,102,241,0.1)" }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: "#374151" }} />
                <Bar stackId="stack" dataKey="out_of_stock" name="Out of Stock" fill="#ef4444" />
                <Bar stackId="stack" dataKey="low_stock" name="Low Stock" fill="#f59e0b" />
                <Bar stackId="stack" dataKey="healthy" name="Healthy" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockStatusByCategory;
