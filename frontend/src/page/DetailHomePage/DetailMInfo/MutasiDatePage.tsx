import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../../style/MutasiRekening.css';

const MutasiDatePage: React.FC = () => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = () => {
    setError(null);
    if (!startDate || !endDate) {
      setError('Silakan pilih tanggal awal dan akhir');
      return;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    if (start > end) {
      setError('Tanggal awal harus sebelum tanggal akhir');
      return;
    }
    if (end > now) {
      setError('Tanggal akhir tidak boleh lebih dari hari ini');
      return;
    }
    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 7) {
      setError('Rentang tanggal maksimal 7 hari');
      return;
    }
    // Bypass PIN verification and navigate directly
    navigate('/user/minfo/mutasi/list', { state: { startDate: start.toISOString(), endDate: end.toISOString() } });
  };

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const today = new Date().toISOString().split('T')[0];
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className="mutasi-container">
      <div className="date-page-header">
        <div className="header-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 2V6M16 2V6M3 10H21M5 4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4Z" 
                  stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea"/>
                <stop offset="100%" stopColor="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 className="page-title">Pilih Periode Mutasi</h2>
        <p className="page-subtitle">Pilih rentang tanggal untuk melihat mutasi rekening Anda</p>
      </div>

      {error && (
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error}</div>
        </div>
      )}

      <div className="date-selection-card">
        <div className="card-header">
          <h3>Periode Mutasi</h3>
          <span className="info-badge">Maksimal 7 hari</span>
        </div>
        
        <div className="date-inputs-grid">
          <div className="date-input-group">
            <label className="date-label">
              <span className="label-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Tanggal Mulai
              </span>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                max={today}
                className="modern-date-input"
              />
              {startDate && <div className="date-preview">{formatDateDisplay(startDate)}</div>}
            </label>
          </div>

          <div className="date-separator">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="date-input-group">
            <label className="date-label">
              <span className="label-text">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Tanggal Selesai
              </span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                max={today}
                min={startDate || oneWeekAgo}
                className="modern-date-input"
              />
              {endDate && <div className="date-preview">{formatDateDisplay(endDate)}</div>}
            </label>
          </div>
        </div>

        <div className="quick-select-options">
          <h4>Pilihan Cepat</h4>
          <div className="quick-select-buttons">
            <button 
              className="quick-select-btn"
              onClick={() => {
                const today = new Date();
                setEndDate(today.toISOString().split('T')[0]);
                setStartDate(today.toISOString().split('T')[0]);
              }}
            >
              Hari Ini
            </button>
            <button 
              className="quick-select-btn"
              onClick={() => {
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                setEndDate(yesterday.toISOString().split('T')[0]);
                setStartDate(yesterday.toISOString().split('T')[0]);
              }}
            >
              Kemarin
            </button>
            <button 
              className="quick-select-btn"
              onClick={() => {
                const today = new Date();
                const lastWeek = new Date(today);
                lastWeek.setDate(lastWeek.getDate() - 7);
                setEndDate(today.toISOString().split('T')[0]);
                setStartDate(lastWeek.toISOString().split('T')[0]);
              }}
            >
              7 Hari Terakhir
            </button>
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button className="back-button" onClick={() => navigate('/user/minfo')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Kembali
        </button>
        <button 
          className={`submit-button ${(!startDate || !endDate) ? 'disabled' : ''}`} 
          onClick={handleSubmit}
          disabled={!startDate || !endDate}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Lihat Mutasi
        </button>
      </div>
    </div>
  );
};

export default MutasiDatePage;
