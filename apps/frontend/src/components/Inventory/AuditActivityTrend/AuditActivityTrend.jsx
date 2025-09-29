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
    <div className="aat-unique-card">
      <div className="aat-unique-header">
        <h3 className="aat-unique-title">Audit Activity (Last 30 Days)</h3>
        <div className="aat-unique-sub">Daily insert/update/delete counts</div>
      </div>

      <div className="aat-unique-body">
        {loading ? (
          <div className="aat-unique-loader">Loading…</div>
        ) : error ? (
          <div className="aat-unique-error">{error}</div>
        ) : data.length === 0 ? (
          <div className="aat-unique-empty">No activity available</div>
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
