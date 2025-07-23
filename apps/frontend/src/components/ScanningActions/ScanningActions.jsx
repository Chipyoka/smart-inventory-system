import React, { useState } from 'react';
import ScannerTable from '../ScannerTable/ScannerTable';
import './ScanningActions.css';

const ScanningActions = ({ onClose }) => {
  const [mode, setMode] = useState('');

  return (
    <div className="scan-action-panel">
      {!mode ? (
        <>
          <h2>Item Scanning</h2>
          <p>Please select the intended barcode scanning action:</p>
          <div className="actions">
            <button onClick={() => setMode('leave')}>Item Leaving Inventory</button>
            <button onClick={() => setMode('enter')}>Item Entering Inventory</button>
          </div>
          <button className="close" onClick={onClose}>Cancel</button>
        </>
      ) : (
        <ScannerTable mode={mode} onClose={onClose} />
      )}
    </div>
  );
};

export default ScanningActions;
