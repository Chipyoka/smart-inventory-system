import React, { useState } from 'react';
import { FaFileAlt } from 'react-icons/fa';
import { useUserStore } from '../../store/userStore';
import axios from '../../api/axiosInstance';
import { toast } from 'react-toastify';
import './ReportButton.css';

const ReportButtonUnique = () => {
  const { role } = useUserStore(state => state.user);
  const [loading, setLoading] = useState(false);

  if (!['admin', 'manager'].includes(role)) return null;

  const handleDownload = (data, filename) => {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/reports/inventory', {
        responseType: 'blob',
      });

      handleDownload(response.data, 'Inventory_Report.pdf');
      toast.success('Report downloaded successfully!');
    } catch (error) {
      console.error('Report generation failed:', error);
      toast.error('Failed to generate report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rb-unique-container">
      <button
        className="rb-unique-btn"
        onClick={handleGenerateReport}
        disabled={loading}
        aria-label="Generate Inventory Report"
      >
        {loading ? (
          <div className="rb-unique-spinner" />
        ) : (
          <>
            <span className="rb-unique-label">Generate Report</span>
            <FaFileAlt className="rb-unique-icon" />
          </>
        )}
      </button>
    </div>
  );
};

export default ReportButtonUnique;
