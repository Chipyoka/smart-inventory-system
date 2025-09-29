import React, { useState } from 'react';
import { FaArrowCircleUp, FaArrowCircleDown } from 'react-icons/fa';
import { IoCloseSharp } from 'react-icons/io5';
import ScannerTableUnique from '../ScannerTable/ScannerTable';
import ScannerTable2Unique from '../ScannerTable/ScannerTable2';
import './ScanningActions.css';

const ScanningActionsUnique = ({ onClose }) => {
  const [mode, setMode] = useState('');

  const backToMenu = () => setMode('');

  return (
    <div className="invact-overlay">
      <div className="invact-panel">
        {/* Top Close Button */}
        <button className="invact-close-btn" onClick={onClose}>
          <IoCloseSharp size={24} />
        </button>

        {/* Mode Selection Screen */}
        {!mode ? (
          <>
            <h2 className="invact-heading">Item Scanning</h2>
            <p className="invact-description">Select the intended barcode scanning action</p>
            <div className="invact-actions">
              <button className="invact-enter-btn" onClick={() => setMode('enter')}>
                <FaArrowCircleDown className="invact-icon" />
                <span>Item Entering Inventory</span>
              </button>
              <button className="invact-leave-btn" onClick={() => setMode('leave')}>
                <FaArrowCircleUp className="invact-icon" />
                <span>Item Leaving Inventory</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {mode === 'enter' && (
              <ScannerTableUnique mode={mode} onClose={backToMenu} />
            )}
            {mode === 'leave' && (
              <ScannerTable2Unique mode={mode} onClose={backToMenu} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ScanningActionsUnique;
