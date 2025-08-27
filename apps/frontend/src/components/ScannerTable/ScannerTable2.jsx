import React, { useState, useRef } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import axios from "../../api/axiosInstance";
import "./ScannerTable2.css";

const ScannerDelete = ({ onClose }) => {
  const videoRef = useRef(null);
  const codeReaderRef = useRef(null);

  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [scannedItems, setScannedItems] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const startScan = async () => {
    if (!videoRef.current) return addToast("Camera not available", "error");
    setScanning(true);
    codeReaderRef.current = new BrowserMultiFormatReader();

    codeReaderRef.current.decodeFromVideoDevice(null, videoRef.current, async (result, err) => {
      if (result) {
        const code = result.getText();
        if (!scannedItems.some(i => i.barcode === code)) {
          try {
            const { data } = await axios.get(`/api/items/by-barcode/${code}`);
            setScannedItems(prev => [...prev, data]);
            addToast(`Item "${data.name}" added`, "success");
          } catch (err) {
            addToast("Item not found", "error");
          }
        } else {
          addToast("Item already scanned", "warning");
        }
      }
      if (err && err.name !== "NotFoundException") console.warn(err);
    });
  };

  const stopScan = async () => {
    if (codeReaderRef.current) codeReaderRef.current.reset();
    setScanning(false);
  };

  const handleManualSubmit = async e => {
    e.preventDefault();
    if (!barcode.trim()) return;
    try {
      const { data } = await axios.get(`/api/items/by-barcode/${barcode}`);
      if (!scannedItems.some(i => i.barcode === data.barcode)) {
        setScannedItems(prev => [...prev, data]);
        addToast(`Item "${data.name}" added`, "success");
      } else addToast("Item already scanned", "warning");
    } catch (err) {
      addToast("Item not found", "error");
    }
    setBarcode("");
  };

  const handleDeleteItem = index => {
    const removed = scannedItems[index];
    setScannedItems(prev => prev.filter((_, i) => i !== index));
    addToast(`Removed "${removed.name}"`, "warning");
  };

  const handleBulkDelete = async () => {
    if (!scannedItems.length) return addToast("No items to delete", "error");
    const barcodes = scannedItems.map(i => i.barcode);
    try {
      const { data } = await axios.post("/api/items/delete", { barcodes });
      setScannedItems([]);
      addToast(data.message, "success");
    } catch (err) {
      console.error(err);
      addToast("Failed to delete items", "error");
    }
  };

  return (
    <div className="scanner-ui-wrapper">
      <div className="toast-container">
        {toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>)}
      </div>

      <div className="scanner-card">
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="scanner-body">
          <div className="product-list">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Barcode</th>
                  <th>Name</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scannedItems.length === 0 ? (
                  <tr><td colSpan="4">No items scanned</td></tr>
                ) : scannedItems.map((item, idx) => (
                  <tr key={item.product_id}>
                    <td>{idx + 1}</td>
                    <td>{item.barcode}</td>
                    <td>{item.name}</td>
                    <td>
                      <button onClick={() => handleDeleteItem(idx)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scanner-box">
            <video ref={videoRef} className="scanner-preview" muted autoPlay playsInline />
            <button onClick={scanning ? stopScan : startScan}>
              {scanning ? "Stop Scanning" : "Start Scanning"}
            </button>

            <form onSubmit={handleManualSubmit}>
              <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                placeholder="Enter barcode"
                disabled={scanning}
              />
              <button type="submit" disabled={scanning}>Add</button>
            </form>
          </div>
        </div>

        <div className="scanner-footer">
          <button onClick={handleBulkDelete} disabled={!scannedItems.length}>Delete & Save</button>
        </div>
      </div>
    </div>
  );
};

export default ScannerDelete;
