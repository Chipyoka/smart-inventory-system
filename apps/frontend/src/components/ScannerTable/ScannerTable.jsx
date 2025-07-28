import React, { useEffect, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import axios from 'axios';
import { MdQrCodeScanner } from 'react-icons/md';
import Barcode from 'react-barcode';
import './ScannerTable.css';

const ScannerTable = ({ mode, onClose }) => {
  const [items, setItems] = useState([]);
  const [scanner, setScanner] = useState(null);

  const startScan = () => {
    const codeReader = new BrowserMultiFormatReader();
    setScanner(codeReader);

    codeReader.decodeFromVideoDevice(null, 'video', async (result, err) => {
      if (result) {
        const scannedCode = result.getText();

        // Prevent duplicates
        if (!items.find(i => i.barcode === scannedCode)) {
          try {
            const res = await axios.get(`http://localhost:5000/api/inventory/by-barcode/${scannedCode}`);
            setItems(prev => [...prev, res.data]);
          } catch (err) {
            console.warn('Barcode not found in DB:', scannedCode);
          }

          // Stop temporarily and restart to allow re-scan
          await codeReader.stopContinuousDecode();
          await new Promise(res => setTimeout(res, 1000));
          startScan(); // Restart scanning
        }
      }
    });
  };

  useEffect(() => {
    startScan();
    return () => {
      if (scanner) scanner.reset();
    };
  }, []);

  const remove = id => setItems(items.filter(i => i.id !== id));

  const save = async () => {
    try {
      const payload = items.map(item => ({
        product_id: item.product_id, // assuming it's already a UUID
        name: item.name,
        barcode: item.barcode,
        category_id: item.category_id || null,
        supplier_id: item.supplier_id || null,
        selling_price: item.selling_price,
        stock: 1, // default to 1 added unit
        location: item.location || '',
        batch_number: item.batch_number || '',
        expiry_date: item.expiry_date || null,
      }));

      await axios.post('http://localhost:5000/api/inventory/bulk-insert', { items: payload });
      onClose();
    } catch (err) {
      console.error('Error saving items:', err);
    }
  };

  return (
    <div className="scanner-ui-wrapper">
      <div className="scanner-card">
        <div className="scanner-header">
          <h2>Scanning in Progress</h2>
          <p>Make sure item barcode is within the frame</p>
        </div>

        <div className="scanner-body">
          <div className="product-list">
            <p className="sub-label">Below are the products you have scanned</p>
            <table>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.product_id || index}>
                    <td><span className="badge">{index + 1}</span></td>
                    <td>{item.barcode}</td>
                    <td>{item.name}</td>
                    <td>K{item.selling_price?.toFixed(2)}</td>
                    <td><Barcode value={item.barcode} height={30} /></td>
                    <td><button className="remove-btn" onClick={() => remove(item.product_id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="scanner-box">
            <video id="video" className="scanner-preview w-full" />
            <button className="scan-btn" onClick={startScan}>
              <MdQrCodeScanner size={24} />
              <div>Scan</div>
            </button>
            <p className="status-tag">No errors, all good</p>
          </div>
        </div>

        <div className="scanner-footer">
          <button className="save-btn" onClick={save}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ScannerTable;
