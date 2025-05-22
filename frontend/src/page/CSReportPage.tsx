import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CSReport.css';

interface Report {
  report_id: string;
  nasabah_id: string;
  email: string;
  deskripsi: string;
  status: 'DIPROSES' | 'DITERIMA' | 'DIABAIKAN';
  createdAt: string;
}

const CSReportPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'DIPROSES' | 'DITERIMA' | 'DIABAIKAN'>('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('cs_token');
      if (!token) {
        navigate('/cs/login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/cs/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch reports');
      
      const data = await response.json();
      setReports(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, status: 'DITERIMA' | 'DIABAIKAN') => {
    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch(`http://localhost:3000/api/cs/report/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      fetchReports();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const filteredReports = reports.filter(report => 
    filter === 'ALL' ? true : report.status === filter
  );

  return (
    <div className="cs-report-container">
      <div className="cs-report-header">
        <div className="header-top">
          <button 
            className="back-button"
            onClick={() => navigate('/cs/dashboard')}
          >
            ← Kembali
          </button>
          <h1>Kelola Laporan Nasabah</h1>
        </div>
        <div className="cs-report-filters">
          <button 
            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            Semua
          </button>
          <button 
            className={`filter-btn ${filter === 'DIPROSES' ? 'active' : ''}`}
            onClick={() => setFilter('DIPROSES')}
          >
            Diproses
          </button>
          <button 
            className={`filter-btn ${filter === 'DITERIMA' ? 'active' : ''}`}
            onClick={() => setFilter('DITERIMA')}
          >
            Diterima
          </button>
          <button 
            className={`filter-btn ${filter === 'DIABAIKAN' ? 'active' : ''}`}
            onClick={() => setFilter('DIABAIKAN')}
          >
            Diabaikan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map(report => (
            <div key={report.report_id} className="report-card">
              <div className="report-header">
                <span className={`status-badge ${report.status.toLowerCase()}`}>
                  {report.status}
                </span>
                <span className="report-date">
                  {new Date(report.createdAt).toLocaleDateString('id-ID')}
                </span>
              </div>
              <div className="report-content">
                <p className="report-email">{report.email}</p>
                <p className="report-description">{report.deskripsi}</p>
              </div>
              {report.status === 'DIPROSES' && (
                <div className="report-actions">
                  <button 
                    className="action-btn accept"
                    onClick={() => handleStatusUpdate(report.report_id, 'DITERIMA')}
                  >
                    Terima
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => handleStatusUpdate(report.report_id, 'DIABAIKAN')}
                  >
                    Abaikan
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CSReportPage;