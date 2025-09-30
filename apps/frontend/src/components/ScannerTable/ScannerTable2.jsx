import React, { useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from 'axios';
import { MdQrCodeScanner } from 'react-icons/md';
import './ScannerTableUnique.css';

const ScannerTableUnique = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Idle. Click Scan to start.');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualStatus, setManualStatus] = useState('');

  // 🔹 Helper: fetch item from DB by barcode
  const fetchItemByBarcode = async (barcode) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/inventory/by-barcode/${barcode}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      console.error('Item fetch failed:', err);
      return null;
    }
  };

  // 🔹 Start scanning
  const startScan = async () => {
    setStatusMsg('Starting camera...');
    if (scanner) {
      try { await scanner.reset(); } catch {}
      setScanner(null);
    }

    const codeReader = new BrowserMultiFormatReader();
    setScanner(codeReader);
    setScanning(true);
    setStatusMsg('Scanning... Align barcode within the frame');

    codeReader.decodeFromVideoDevice(null, 'invscan-video', async (result, err) => {
      if (result) {
        const scannedCode = result.getText();
        if (!items.find(i => i.barcode === scannedCode)) {
          setStatusMsg(`Barcode found: ${scannedCode}. Fetching...`);
          const product = await fetchItemByBarcode(scannedCode);

          if (!product) {
            setStatusMsg(`No item found for: ${scannedCode}`);
          } else {
            setItems(prev => [...prev, product]);
            setStatusMsg(`Product "${product.name}" added to deletion list.`);
          }

          await codeReader.reset();
          setScanning(false);
          setStatusMsg('Scan paused. Click Scan to continue.');
        }
      }
      if (err && err.name !== 'NotFoundException') {
        console.error('Scanner error:', err);
      }
    });
  };

  // 🔹 Stop scanning
  const stopScan = async () => {
    if (scanner) {
      await scanner.reset();
      setScanner(null);
      setScanning(false);
      setStatusMsg('Scan stopped.');
    }
  };

  // 🔹 Manual barcode entry
  const handleManualSubmit = async () => {
    if (!manualBarcode.trim()) {
      setManualStatus('Please enter a valid barcode.');
      return;
    }

    const barcode = manualBarcode.trim();
    if (items.some(i => i.barcode === barcode)) {
      setManualStatus('Item already added.');
      return;
    }

    setManualStatus(`Looking up ${barcode}...`);
    const product = await fetchItemByBarcode(barcode);

    if (!product) {
      setManualStatus(`No item found for: ${barcode}`);
      setManualBarcode('');
      return;
    }

    setItems(prev => [...prev, product]);
    setManualStatus(`Item "${product.name}" added to deletion list.`);
    setManualBarcode('');
  };

  // 🔹 Delete a single item
  const deleteItem = async (product_id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;

    const token = localStorage.getItem('token');
    try {
      await axios.post(
        'http://localhost:5000/api/inventory/bulk-delete',
        { product_ids: [product_id] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems(prev => prev.filter(i => i.product_id !== product_id));
      alert('Item deleted successfully.');
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete item. Check console.');
    }
  };

  // 🔹 Bulk delete all items
  const bulkDeleteAll = async () => {
    if (items.length === 0) return;
    if (!window.confirm('Are you sure you want to delete ALL items in the list?')) return;

    const token = localStorage.getItem('token');
    try {
      const product_ids = items.map(i => i.product_id);
      await axios.post(
        'http://localhost:5000/api/inventory/bulk-delete',
        { product_ids },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setItems([]);
      alert('All items deleted successfully.');
    } catch (err) {
      console.error('Bulk delete error:', err);
      alert('Failed to delete items. Check console.');
    }
  };

  return (
    <div className="invscan-wrapper">
      <div className="invscan-card">
        {/* Close button */}
        <button className="invscan-close-btn" onClick={onClose}>
          &times;
        </button>

        {/* Header */}
        <div className="invscan-header">
          <h2>Inventory Scanner / Delete</h2>
          <p>Scan or enter barcodes manually, then delete items.</p>
        </div>

        {/* Body */}
        <div className="invscan-body">
          {/* Items table */}
          <div className="invscan-product-list">
            <p className="invscan-sub-label">Items Ready for Deletion:</p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Barcode</th>
                  <th>Name</th>
                  <th>Price (K)</th>
                  <th>Quality</th>
                  <th>Stock</th>
                  <th>Expiry</th>
                  <th>Location</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center' }}>
                      No items added.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.product_id ?? `temp-${index}`}>
                      <td><span className="invscan-badge">{index + 1}</span></td>
                      <td>{item.barcode}</td>
                      <td>{item.name}</td>
                      <td>{item.selling_price}</td>
                      <td>{item.quality}</td>
                      <td>{item.stock}</td>
                      <td>{item.expiry_date}</td>
                      <td>{item.location}</td>
                      <td>
                        <button
                          className="invscan-remove-btn"
                          onClick={() => deleteItem(item.product_id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* 🔹 Bulk delete button */}
            {items.length > 0 && (
              <button className="invscan-remove-btn bulk-delete-btn" onClick={bulkDeleteAll}>
                Delete All
              </button>
            )}
          </div>

          {/* Scanner & Manual entry */}
          <div className="invscan-box">
            <video id="invscan-video" className="invscan-preview" />
            <button
              className="invscan-scan-btn"
              onClick={() => (scanning ? stopScan() : startScan())}
            >
              <MdQrCodeScanner size={24} />
              {scanning ? 'Stop Scan' : 'Start Scan'}
            </button>
            <p className="invscan-status">{statusMsg}</p>

            {/* Manual entry */}
            <div className="invscan-manual-entry">
              <label htmlFor="invscan-manual-barcode">Enter Barcode Manually:</label>
              <input
                type="text"
                id="invscan-manual-barcode"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="e.g., 6009711322467"
              />
              <button
                className="invscan-scan-btn invscan-manual-btn"
                onClick={handleManualSubmit}
              >
                Submit Barcode
              </button>
              <p className="invscan-status">{manualStatus}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScannerTableUnique;
