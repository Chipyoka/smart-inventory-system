import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import './ScannerTable.css';

const ScannerTable = ({ mode, onClose }) => {
  const [items, setItems] = useState([]);
  const [scanner, setScanner] = useState(null);
  const scannerRef = useRef(null);

  const onScanSuccess = async (decodedText) => {
    if (!items.find(i => i.barcode === decodedText)) {
      try {
        const res = await axios.get(`http://localhost:5000/api/inventory/by-barcode/${decodedText}`);
        setItems(prev => [...prev, res.data]);
        await scanner.stop();
        scanner.clear();
        setScanner(null);
      } catch {
        console.warn('Barcode not found in DB');
      }
    }
  };

  useEffect(() => {
    const html5Qrcode = new Html5Qrcode("reader");
    setScanner(html5Qrcode);
    html5Qrcode.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      onScanSuccess
    ).catch(console.error);

    return () => {
      html5Qrcode.stop().catch(() => {});
      html5Qrcode.clear().catch(() => {});
    };
  }, []);

  const remove = id => setItems(items.filter(i => i.id !== id));
  const save = async () => {
    const ids = items.map(i => i.id);
    await axios.post('http://localhost:5000/api/inventory/delete', { ids });
    onClose();
  };

  return (
    <div className="scanner-table-panel">
      <h2>Scanning in Progress</h2>
      <p>Make sure the item is placed within the camera view.</p>
      <div id="reader" style={{ width: '100%', height: '300px', margin: '16px auto' }} />
      <h3>Scanned:</h3>
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Price</th><th>Action</th></tr></thead>
        <tbody>
          {items.map((it, idx) => (
            <tr key={it.id}>
              <td>{idx + 1}</td>
              <td>{it.name}</td>
              <td>${it.selling_price.toFixed(2)}</td>
              <td><button onClick={() => remove(it.id)}>Remove</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="save-btn" onClick={save}>Save & Remove Items</button>
    </div>
  );
};

export default ScannerTable;
