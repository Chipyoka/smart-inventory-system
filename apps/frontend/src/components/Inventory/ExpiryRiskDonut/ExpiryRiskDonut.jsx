import React, { useEffect, useState } from "react";
import axios from "../../../api/axiosInstance";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from "recharts";
import "./ExpiryRiskDonut.css";

const BUCKET_ORDER = ['Expired','≤30 days','31–60 days','61–90 days','>90 days','No expiry'];
const COLORS = ["#dc2626", "#f97316", "#fbbf24", "#3b82f6", "#10b981", "#9ca3af"];

const ExpiryRiskDonut = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get("/analytics/expiry-risk-buckets");
        const rows = Array.isArray(res.data) ? res.data : [];
        const map = new Map(rows.map(r => [r.bucket, Number(r.count) || 0]));
        const ordered = BUCKET_ORDER.map(b => ({ bucket: b, count: map.get(b) ?? 0 }));
        if (mounted) setData(ordered);
      } catch (e) {
        setErr(e.response?.data?.message || e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="erd-unique-card">
      <div className="erd-unique-header">
        <h3 className="erd-unique-title">Expiry Risk (Items)</h3>
        <div className="erd-unique-sub">Groups items by expiry horizon</div>
      </div>

      <div className="erd-unique-body">
        {loading ? (
          <div className="erd-unique-loader">Loading…</div>
        ) : err ? (
          <div className="erd-unique-error">{err}</div>
        ) : (
          <div className="erd-unique-chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="bucket"
                  innerRadius={64}
                  outerRadius={100}
                  paddingAngle={4}
                  labelLine={false}
                  label={({ percent }) =>
                    percent > 0.03 ? `${(percent * 100).toFixed(0)}%` : ""
                  }
                  isAnimationActive={true}
                >
                  {data.map((entry, idx) => (
                    <Cell
                      key={`cell-${idx}`}
                      fill={COLORS[idx % COLORS.length]}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value}`,
                    `${props.payload.bucket}`
                  ]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{
                    fontSize: 12,
                    color: "#374151",
                    marginTop: 8
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpiryRiskDonut;
