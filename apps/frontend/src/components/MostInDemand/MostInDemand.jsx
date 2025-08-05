import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { toast } from "react-toastify";
import "./MostInDemand.css";

const currencyFormatter = new Intl.NumberFormat("en-ZM", {
  style: "currency",
  currency: "ZMW",
  minimumFractionDigits: 2,
});

const MostInDemand = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMostInDemand = async () => {
      try {
        const res = await api.get("/items/most-in-demand");

        if (!Array.isArray(res.data)) {
          throw new Error("Invalid response format: expected array");
        }

        setItems(res.data);
      } catch (err) {
        console.error("MostInDemand fetch error:", err.response?.data || err.message);
        toast.error("Failed to fetch most in-demand products.");
        setError("Failed to fetch most in-demand products.");
      } finally {
        setLoading(false);
      }
    };

    fetchMostInDemand();
  }, []);

  return (
    <div className="mid-products">
      <h3>Most-in-Demand (MID) Products</h3>

      {loading && (
        <p aria-live="polite" className="status-message">
          Loading...
        </p>
      )}

      {error && (
        <p role="alert" className="error status-message">
          {error}
        </p>
      )}

      {!loading && !error && items.length === 0 && (
        <p aria-live="polite" className="status-message">
          No in-demand products found.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <table>
          <caption className="sr-only">Most-in-demand products table</caption>
          <thead>
            <tr>
              <th scope="col">Item Name</th>
              <th scope="col">Price</th>
              <th scope="col">Stock</th>
              <th scope="col">Barcode</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.product_id || item.barcode || item.name}>
                <td>{item.name}</td>
                <td>{currencyFormatter.format(item.selling_price)}</td>
                <td>{item.stock}</td>
                <td>{item.barcode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MostInDemand;
