import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import "./InventoryValueByCategory.css";

const InventoryValueByCategory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/analytics/inventory-value-by-category");
        if (mounted && Array.isArray(res.data)) {
          const normalized = res.data.map(r => ({
            ...r,
            value: Number(r.value) || 0
          }));
          setData(normalized);
        }
      } catch (e) {
        setErr(e.response?.data?.message || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="ivbc-unique-card">
      <div className="ivbc-unique-header">
        <h3 className="ivbc-unique-title">Inventory Value by Category</h3>
        <div className="ivbc-unique-sub">Total value per category</div>
      </div>

      <div className="ivbc-unique-body">
        {loading ? (
          <div className="ivbc-unique-loader">Loading…</div>
        ) : err ? (
          <div className="ivbc-unique-error">{err}</div>
        ) : data.length === 0 ? (
          <div className="ivbc-unique-empty">No data</div>
        ) : (
          <div className="ivbc-unique-chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={data}
                margin={{ top: 12, right: 16, bottom: 24, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#374151", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "#374151", fontSize: 12 }}
                  tickFormatter={(val) => `${Number(val).toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toLocaleString()}`,
                    "Value"
                  ]}
                  contentStyle={{ borderRadius: 8 }}
                />
                <Bar
                  dataKey="value"
                  name="Value"
                  fill="#6366f1"
                  radius={[8, 8, 0, 0]}
                  barSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryValueByCategory;
