import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import "./NotificationsCenter.css";

const NotificationsCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get("/items/notifications");

        if (!Array.isArray(res.data)) {
          throw new Error("Invalid response format: expected array");
        }

        setNotifications(res.data);
      } catch (err) {
        console.error("NotificationsCenter fetch error:", err.response?.data || err.message);
        toast.error("Failed to fetch notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="notifications-center">
      <h3>Notifications Center</h3>
      {loading ? (
        <p className="status-message">Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="status-message">No alerts found.</p>
      ) : (
        <div className="notifications-list">
          <ul>
            {notifications.map((note, idx) => (
              <li key={idx} className={`notification ${note.type}`}>
                <div className="note-header">
                  <span className={`badge ${note.type}`}>
                    {note.type.replace("_", " ").toUpperCase()}
                  </span>
                </div>
                <div className="message">{note.message}</div>
                <div className="barcode">Barcode: {note.barcode}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationsCenter;
