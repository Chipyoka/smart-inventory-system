import React, { useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from 'axios';
import { MdQrCodeScanner } from 'react-icons/md';
import './ScannerTable.css';

const ScannerTable = ({ onClose }) => {
  const [items, setItems] = useState([]);
  const [scanner, setScanner] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Idle. Click Scan to start.');
  const [manualBarcode, setManualBarcode] = useState('');
  const [manualStatus, setManualStatus] = useState('');

  // Start scanning
  const startScan = async () => {
    if (scanner) {
      await scanner.reset().catch(() => {});
      setScanner(null);
    }

    const codeReader = new BrowserMultiFormatReader();
    setScanner(codeReader);
    setScanning(true);
    setStatusMsg('Scanning... Align barcode within the frame');

    codeReader.decodeFromVideoDevice(null, 'scanner-unique-video', async (result, err) => {
      if (result) {
        const barcode = result.getText();
        if (!items.find(i => i.barcode === barcode)) {
          setStatusMsg(`Barcode found: ${barcode}. Fetching data...`);
          try {
            const res = await axios.get(`http://localhost:5000/api/inventory/by-barcode/${barcode}`);
            const product = {
              ...res.data,
              quality: res.data.quality || '',
              quantity: res.data.stock || 1,
              expiry_date: res.data.expiry_date || null,
              location: res.data.location || '',
              selling_price: parseFloat(res.data.selling_price) || 0,
              category_id: res.data.category_id || null,
              supplier_id: res.data.supplier_id || null,
              batch_number: res.data.batch_number || '',
            };
            setItems(prev => [...prev, product]);
            setStatusMsg(`Product "${product.name}" added successfully.`);
          } catch {
            // If not found, just add with barcode only
            const product = { barcode, name: '', selling_price: 0, quantity: 1, quality: '', expiry_date: null, location: '', category_id: null, supplier_id: null, batch_number: '' };
            setItems(prev => [...prev, product]);
            setStatusMsg(`No product found for: ${barcode}. Added as new item.`);
          }
        } else {
          setStatusMsg(`Barcode "${barcode}" already scanned.`);
        }
      }
      if (err && err.name !== 'NotFoundException') console.error('Scanner error:', err);
    });
  };

  const stopScan = async () => {
    if (scanner) {
      await scanner.reset();
      setScanner(null);
    }
    setScanning(false);
    setStatusMsg('Scan stopped.');
  };

  // Manual barcode lookup
  const fetchFromExternal = async barcode => {
    try {
      const res = await axios.get(`http://localhost:5000/api/external-lookup/${barcode}`);
      return { name: res.data.name || '' };
    } catch {
      return { name: '' };
    }
  };

  const handleManualBarcodeSubmit = async () => {
    const barcode = manualBarcode.trim();
    if (!barcode) return setManualStatus('Please enter a valid barcode.');
    if (items.some(i => i.barcode === barcode)) return setManualStatus('Item already added.');

    setManualStatus(`Looking up ${barcode}...`);
    const { name } = await fetchFromExternal(barcode);

    const newItem = {
      barcode,
      name,
      selling_price: 0,
      quantity: 1,
      quality: '',
      expiry_date: null,
      location: '',
      category_id: null,
      supplier_id: null,
      batch_number: '',
    };

    setItems(prev => [...prev, newItem]);
    setManualStatus(name ? `Found: "${name}"` : 'No match found. Enter details manually.');
    setManualBarcode('');
  };

  const handleInputChange = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const remove = barcode => setItems(items.filter(i => i.barcode !== barcode));

  // Save to database via bulkInsertItems
  const save = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in to save items.');

    try {
      const payload = items.map(item => ({
        name: item.name || '',
        barcode: item.barcode,
        category_id: item.category_id || null,
        supplier_id: item.supplier_id || null,
        selling_price: parseFloat(item.selling_price) || 0,
        quantity: parseInt(item.quantity) || 1,
        quality: item.quality || '',
        location: item.location || '',
        batch_number: item.batch_number || '',
        expiry_date: item.expiry_date || null,
      }));

      // Validation
      for (const item of payload) {
        if (!item.barcode) return alert('Barcode cannot be empty.');
        if (!item.name) return alert('Name cannot be empty.');
        if (item.quantity < 1) return alert(`Invalid quantity for ${item.name}`);
        if (item.selling_price < 0) return alert(`Invalid price for ${item.name}`);
      }

      await axios.post('http://localhost:5000/api/inventory/bulk-insert', { items: payload }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert('All items saved successfully!');
      onClose();
    } catch (err) {
      console.error('Save error:', err);
      alert('Failed to save items. Check console for details.');
    }
  };

  return (
    <div className="scanner-unique-wrapper">
      <div className="scanner-unique-card">
        <button className="scanner-unique-close-btn" onClick={onClose}>&times;</button>

        <div className="scanner-unique-header">
          <h2>Inventory Scanner</h2>
          <p>Scan barcodes or enter them manually, then update item details before saving.</p>
        </div>

        <div className="scanner-unique-body">
          <div className="scanner-unique-product-list">
            <p className="scanner-unique-sub-label">Scanned Items:</p>
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Barcode</th><th>Name</th><th>Price (K)</th><th>Quality</th>
                  <th>Qty</th><th>Expiry</th><th>Location</th><th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign: 'center' }}>No items scanned.</td></tr>
                ) : items.map((item, index) => (
                  <tr key={item.barcode}>
                    <td><span className="scanner-unique-badge">{index + 1}</span></td>
                    <td>{item.barcode}</td>
                    <td><input type="text" value={item.name} onChange={e => handleInputChange(index, 'name', e.target.value)} /></td>
                    <td><input type="number" min="0" step="0.01" value={item.selling_price} onChange={e => handleInputChange(index, 'selling_price', e.target.value)} /></td>
                    <td><input type="text" value={item.quality} onChange={e => handleInputChange(index, 'quality', e.target.value)} /></td>
                    <td><input type="number" min="1" value={item.quantity} onChange={e => handleInputChange(index, 'quantity', e.target.value)} /></td>
                    <td><input type="date" value={item.expiry_date || ''} onChange={e => handleInputChange(index, 'expiry_date', e.target.value)} /></td>
                    <td><input type="text" value={item.location} onChange={e => handleInputChange(index, 'location', e.target.value)} /></td>
                    <td><button className="scanner-unique-remove-btn" onClick={() => remove(item.barcode)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scanner-unique-box">
            <video id="scanner-unique-video" className="scanner-unique-preview" />
            <button className="scanner-unique-scan-btn" onClick={() => (scanning ? stopScan() : startScan())}>
              <MdQrCodeScanner size={24} /> {scanning ? 'Stop Scan' : 'Start Scan'}
            </button>
            <p className="scanner-unique-status-tag">{statusMsg}</p>

            <div style={{ marginTop: '20px' }}>
              <label htmlFor="manual-barcode">Enter Barcode Manually:</label>
              <input type="text" id="manual-barcode" value={manualBarcode} onChange={e => setManualBarcode(e.target.value)} placeholder="e.g., 6009711322467" />
              <button className="scanner-unique-scan-btn manual" onClick={handleManualBarcodeSubmit}>Submit Barcode</button>
              <p className="scanner-unique-status-tag">{manualStatus}</p>
            </div>
          </div>
        </div>

        <div className="scanner-unique-footer">
          <button className="scanner-unique-save-btn" onClick={save} disabled={items.length === 0}>Save Items</button>
        </div>
      </div>
    </div>
  );
};

export default ScannerTable;
