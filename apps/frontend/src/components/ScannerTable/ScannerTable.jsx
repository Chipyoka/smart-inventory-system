import React, { useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from 'axios';
import { MdQrCodeScanner } from 'react-icons/md';
import Barcode from 'react-barcode';
import './ScannerTable.css';

const ScannerTable = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Idle. Click Scan to start.');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualStatus, setManualStatus] = useState('');

  const startScan = async () => {
    setStatusMsg('Starting camera...');
    if (scanner) {
      try {
        await scanner.reset();
      } catch {}
      setScanner(null);
    }

    const codeReader = new BrowserMultiFormatReader();
    setScanner(codeReader);
    setScanning(true);
    setStatusMsg('Scanning... Align barcode within the frame');

    codeReader.decodeFromVideoDevice(null, 'video', async (result, err) => {
      if (result) {
        const scannedCode = result.getText();
        if (!items.find(i => i.barcode === scannedCode)) {
          setStatusMsg(`Barcode found: ${scannedCode}. Fetching data...`);
          try {
            const res = await axios.get(`http://localhost:5000/api/inventory/by-barcode/${scannedCode}`);
            const product = {
              ...res.data,
              quality: '',
              quantity: 1,
              expiry_date: '',
              location: '',
              selling_price: res.data.selling_price || 0
            };
            setItems(prev => [...prev, product]);
            setStatusMsg(`Product "${product.name}" added successfully.`);
          } catch {
            setStatusMsg(`No product found for: ${scannedCode}`);
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

  const stopScan = async () => {
    if (scanner) {
      await scanner.reset();
      setScanner(null);
      setScanning(false);
      setStatusMsg('Scan stopped.');
    }
  };

  const fetchFromExternal = async (barcode) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/external-lookup/${barcode}`);
      return { name: res.data.name };
    } catch (err) {
      console.error('External lookup failed:', err);
      return { name: '' };
    }
  };

  const handleManualBarcodeSubmit = async () => {
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
    const { name } = await fetchFromExternal(barcode);

    const newItem = {
      product_id: `manual-${Date.now()}`,
      barcode,
      name,
      selling_price: '',
      quality: '',
      quantity: 1,
      expiry_date: '',
      location: '',
      category_id: null,
      supplier_id: null
    };

    setItems(prev => [...prev, newItem]);
    setManualStatus(name ? `Found: "${name}"` : 'No match found. Please enter details manually.');
    setManualBarcode('');
  };

  const handleInputChange = (index, field, value) => {
    setItems(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const remove = product_id => {
    setItems(items.filter(i => i.product_id !== product_id));
  };

  const save = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to save items.');
      return;
    }

    try {
      for (const item of items) {
        if (!item.quantity || isNaN(item.quantity) || item.quantity < 1) {
          alert(`Invalid quantity for ${item.name || item.barcode}`);
          return;
        }
        if (!item.selling_price || isNaN(item.selling_price) || item.selling_price < 0) {
          alert(`Invalid price for ${item.name || item.barcode}`);
          return;
        }
      }

      const payload = items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        barcode: item.barcode,
        category_id: item.category_id || null,
        supplier_id: item.supplier_id || null,
        selling_price: parseFloat(item.selling_price),
        quantity: parseInt(item.quantity),
        quality: item.quality,
        location: item.location,
        batch_number: item.batch_number || '',
        expiry_date: item.expiry_date || null
      }));

      await axios.post(
        'http://localhost:5000/api/inventory/bulk-insert',
        { items: payload },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('All items saved successfully!');
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save items. Check console for details.');
    }
  };

  return (
    <div className="scanner-ui-wrapper">
      <div className="scanner-card">
        <button className="close-btn" onClick={onClose}>&times;</button>

        <div className="scanner-header">
          <h2>Inventory Scanner</h2>
          <p>Scan barcodes or enter them manually, then update item details before saving.</p>
        </div>

        <div className="scanner-body">
          <div className="product-list">
            <p className="sub-label">Scanned Items:</p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Barcode</th>
                  <th>Name</th>
                  <th>Price (K)</th>
                  <th>Quality</th>
                  <th>Qty</th>
                  <th>Expiry</th>
                  <th>Location</th>
                  <th>Preview</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: 'center' }}>No items scanned.</td></tr>
                ) : items.map((item, index) => (
                  <tr key={item.product_id ?? `temp-${index}`}>
                    <td><span className="badge">{index + 1}</span></td>
                    <td>{item.barcode}</td>
                    <td><input type="text" value={item.name} onChange={e => handleInputChange(index, 'name', e.target.value)} /></td>
                    <td><input type="number" min="0" step="0.01" value={item.selling_price} onChange={e => handleInputChange(index, 'selling_price', e.target.value)} /></td>
                    <td><input type="text" value={item.quality} onChange={e => handleInputChange(index, 'quality', e.target.value)} /></td>
                    <td><input type="number" min="1" value={item.quantity} onChange={e => handleInputChange(index, 'quantity', e.target.value)} /></td>
                    <td><input type="date" value={item.expiry_date} onChange={e => handleInputChange(index, 'expiry_date', e.target.value)} /></td>
                    <td><input type="text" value={item.location} onChange={e => handleInputChange(index, 'location', e.target.value)} /></td>
                    <td><Barcode value={item.barcode} height={30} /></td>
                    <td>
                      <button className="remove-btn" onClick={() => remove(item.product_id)}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scanner-box">
            <video id="video" className="scanner-preview" />
            <button className="scan-btn" onClick={() => (scanning ? stopScan() : startScan())}>
              <MdQrCodeScanner size={24} />
              {scanning ? 'Stop Scan' : 'Start Scan'}
            </button>
            <p className="status-tag">{statusMsg}</p>

            <div style={{ marginTop: '20px' }}>
              <label htmlFor="manual-barcode">Enter Barcode Manually:</label>
              <input
                type="text"
                id="manual-barcode"
                value={manualBarcode}
                onChange={e => setManualBarcode(e.target.value)}
                placeholder="e.g., 6009711322467"
              />
              <button
                className="scan-btn"
                style={{ backgroundColor: '#e8f0fe', color: '#1a73e8' }}
                onClick={handleManualBarcodeSubmit}
              >
                Submit Barcode
              </button>
              <p className="status-tag">{manualStatus}</p>
            </div>
          </div>
        </div>

        <div className="scanner-footer">
          <button className="save-btn" onClick={save} disabled={items.length === 0}>
            Save Items
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScannerTable;
