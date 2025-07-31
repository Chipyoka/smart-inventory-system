import React, { useState, useEffect, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import axios from "axios";
import "./ScannerTable2.css";

const ScannerTable2 = ({ onClose }) => {
  const codeReaderRef = useRef(null);
  const videoRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [scannedItems, setScannedItems] = useState([]);
  const [status, setStatus] = useState("");

  // Safe reset scanner instance
  const safeReset = async () => {
    if (codeReaderRef.current && typeof codeReaderRef.current.reset === "function") {
      try {
        await codeReaderRef.current.reset();
      } catch (err) {
        console.warn("Scanner reset error:", err);
      }
    }
  };

  // Initialize scanner instance once on mount
  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    return () => {
      safeReset();
    };
  }, []);

  // Start scanning once triggered
  const startScan = async () => {
    if (!videoRef.current) {
      setStatus("Camera not available");
      return;
    }

    setStatus("Initializing scanner...");
    setScanning(true);

    try {
      const result = await codeReaderRef.current.decodeOnceFromVideoDevice(undefined, videoRef.current);
      const scannedCode = result.text;

      setStatus(`Scanned: ${scannedCode}`);
      await fetchItem(scannedCode);

    } catch (err) {
      console.warn("Scan error or cancelled:", err);
      setStatus("Scan error or cancelled");
    } finally {
      await safeReset();
      setScanning(false);
      setBarcode("");
    }
  };

  // Stop scanning manually
  const stopScan = async () => {
    await safeReset();
    setScanning(false);
    setStatus("Scan stopped");
  };

  // Fetch item info from backend by barcode
  const fetchItem = async (code) => {
    if (!code) return;

    try {
      const res = await axios.get(`/api/items/by-barcode/${code}`);

      if (res.status === 200 && res.data) {
        // Prevent duplicates by product_id
        if (!scannedItems.some(item => item.product_id === res.data.product_id)) {
          setScannedItems(prev => [...prev, res.data]);
          setStatus(`Item "${res.data.name || "Unnamed"}" added.`);
        } else {
          setStatus("Item already scanned.");
        }
      } else {
        setStatus("Item not found.");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setStatus("Item not found for barcode.");
      } else {
        console.error("Fetch item error:", err);
        setStatus("Error fetching item data.");
      }
    }
  };

  // Manual barcode submit handler
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!barcode.trim()) return;

    await fetchItem(barcode.trim());
    setBarcode("");
  };

  // Remove one item from scanned list by index
  const handleDeleteItem = (index) => {
    setScannedItems(prev => prev.filter((_, i) => i !== index));
  };

  // Save: send bulk delete request with product IDs
  const handleSave = async () => {
    if (scannedItems.length === 0) {
      setStatus("No items to delete.");
      return;
    }

    const productIds = scannedItems.map(item => item.product_id);

    try {
      await axios.post("/api/items/bulk-delete", { product_ids: productIds });
      setStatus(`Deleted ${productIds.length} item(s) successfully.`);
      setScannedItems([]);
    } catch (err) {
      console.error("Bulk delete error:", err);
      setStatus("Failed to delete items.");
    }
  };

  return (
    <div className="scanner-ui-wrapper">
      <div className="scanner-card">
        <button className="close-btn" onClick={onClose} aria-label="Close scanner modal">&times;</button>

        <div className="scanner-header">
          <h2>Remove Inventory</h2>
          <p>Scan or enter barcodes to remove items from inventory.</p>
        </div>

        <div className="scanner-body">
          {/* Left: scanned items list */}
          <div className="product-list">
            <p className="sub-label">Scanned Items</p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Barcode</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Batch</th>
                  <th>Expiry</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scannedItems.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center" }}>No items scanned yet.</td>
                  </tr>
                ) : (
                  scannedItems.map((item, index) => (
                    <tr key={item.product_id}>
                      <td>{index + 1}</td>
                      <td>{item.barcode || "-"}</td>
                      <td>{item.name || "-"}</td>
                      <td>{item.category_name || item.category || "-"}</td>
                      <td>{item.batch_number || "-"}</td>
                      <td>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "-"}</td>
                      <td>
                        <button
                          className="remove-btn"
                          onClick={() => handleDeleteItem(index)}
                          aria-label={`Remove ${item.name || "item"}`}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Right: scanner + manual input */}
          <div className="scanner-box">
            <video
              ref={videoRef}
              className="scanner-preview"
              muted
              autoPlay
              playsInline
              style={{ width: "100%", height: "auto" }}
            />

            <button
              className="scan-btn"
              onClick={scanning ? stopScan : startScan}
              disabled={scanning}
              aria-live="polite"
            >
              {scanning ? "Scanning..." : "Scan"}
            </button>

            <form onSubmit={handleManualSubmit} className="manual-barcode-form">
              <label htmlFor="manual-barcode">Enter Barcode Manually</label>
              <input
                id="manual-barcode"
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="e.g. 8901234567890"
                autoComplete="off"
                disabled={scanning}
              />
              <button className="scan-btn" type="submit" disabled={scanning}>
                Add
              </button>
            </form>

            {status && <div className="status-tag" aria-live="polite">{status}</div>}
          </div>
        </div>

        <div className="scanner-footer">
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={scannedItems.length === 0 || scanning}
            title={scannedItems.length === 0 ? "No items to delete" : ""}
          >
            Delete & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScannerTable2;
