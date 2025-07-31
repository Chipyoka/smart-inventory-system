import React, { useState } from 'react';
import { FaArrowCircleUp, FaArrowCircleDown } from 'react-icons/fa';
import { IoCloseSharp } from 'react-icons/io5';
import ScannerTable from '../ScannerTable/ScannerTable';
import ScannerTable2 from '../ScannerTable/ScannerTable2';
import './ScanningActions.css';

const ScanningActions = ({ onClose }) => {
  const [mode, setMode] = useState('');

  const handleBackToMenu = () => {
    setMode(''); // Reset to selection menu
  };

  return (
    <div className="scan-overlay">
      <div className="scan-action-panel">
        {/* Top Close Button */}
        <button className="top-close" onClick={onClose}>
          <IoCloseSharp size={24} />
        </button>

        {/* Mode Selection Screen */}
        {!mode ? (
          <>
            <h2 className="scan-heading">Item Scanning</h2>
            <p className="scan-description">Please select the intended barcode scanning action</p>
            <div className="actions">
              <button className="enter" onClick={() => setMode('enter')}>
                <FaArrowCircleDown className="icon" />
                <span>Item Entering Inventory</span>
              </button>
              <button className="leave" onClick={() => setMode('leave')}>
                <FaArrowCircleUp className="icon" />
                <span>Item Leaving Inventory</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {mode === 'enter' && (
              <ScannerTable mode={mode} onClose={handleBackToMenu} />
            )}
            {mode === 'leave' && (
              <ScannerTable2 mode={mode} onClose={handleBackToMenu} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScanningActions;
