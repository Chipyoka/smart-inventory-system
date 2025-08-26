import React, { useEffect, useState, useMemo } from "react";
import axios from "../../../api/axiosInstance";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";
import "./AuditActivityTrend.css";

// Utility to normalize counts
const normalizeCounts = (rows) =>
  rows.map((r) => ({
    ...r,
    inserts: Number(r.inserts) || 0,
    updates: Number(r.updates) || 0,
    deletes: Number(r.deletes) || 0,
  }));

const AuditActivityTrend = () => {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await axios.get("/analytics/audit-activity-30d");
        if (mounted && Array.isArray(res.data)) {
          setRawData(normalizeCounts(res.data));
        }
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const data = useMemo(() => rawData, [rawData]);

  return (
    <div className="aat-card analytics-card">
      <div className="card-header">
        <h3>Audit Activity (Last 30 Days)</h3>
        <div className="card-sub">Daily insert/update/delete counts</div>
      </div>

      <div className="card-body">
        {loading ? (
          <div className="loader">Loading…</div> // Consider replacing with spinner
        ) : error ? (
          <div className="error">{error}</div> // Style for professional error box
        ) : data.length === 0 ? (
          <div className="empty">No activity available</div> // Optional illustration
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={data}
              margin={{ top: 12, right: 16, bottom: 24, left: 0 }}
              aria-label="Audit Activity Trend Chart"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2ff" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#374151", fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#374151", fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                formatter={(value, name) => [value, name]}
                contentStyle={{ fontSize: 12, color: "#374151" }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ fontSize: 12, color: "#374151" }}
              />
              <Line
                type="monotone"
                dataKey="inserts"
                name="Inserts"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="updates"
                name="Updates"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="deletes"
                name="Deletes"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AuditActivityTrend;
