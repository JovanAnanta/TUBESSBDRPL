import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../style/InfoSaldo.css';

type SaldoInfo = {
  nasabah_id: string;
  nama: string;
  noRekening: string;
  saldo: number;
  lastUpdate: string;
};

const InfoSaldo: React.FC = () => {
  const [saldoInfo, setSaldoInfo] = useState<SaldoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nasabahId = localStorage.getItem('nasabahId');
    
    if (!token || !nasabahId) {
      navigate('/auth/login');
      return;
    }

    // Cek apakah user sudah melalui PIN verification
    const pinVerified = location.state?.pinVerified;
    if (!pinVerified) {
      navigate('/user/minfo');
      return;
    }
    
    fetchSaldoInfo(nasabahId, token);
  }, [navigate, location]);

  const fetchSaldoInfo = async (nasabahId: string, token: string) => {
    try {
      const response = await fetch(`/api/user/saldo/${nasabahId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil informasi saldo');
      }

      const result = await response.json();
      if (result.success) {
        setSaldoInfo(result.data);
      } else {
        throw new Error(result.message || 'Gagal mengambil informasi saldo');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data saldo');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (loading) {
    return (
      <div className="info-saldo-container">
        <div className="info-saldo-wrapper">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Memuat informasi saldo...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="info-saldo-container">
      <div className="info-saldo-wrapper">
        {/* Header Section */}
        <div className="info-saldo-header">
          <div className="info-saldo-icon">💰</div>
          <h1 className="info-saldo-title">Info Saldo</h1>
          <p className="info-saldo-subtitle">Informasi Rekening & Saldo</p>
        </div>

        {/* Content Card */}
        <div className="info-saldo-card">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {saldoInfo && (
            <>
              <div className="saldo-section">
                <div className="account-info">
                  <h3 className="section-title">
                    <span className="section-icon">👤</span>
                    Informasi Rekening
                  </h3>
                  <div className="info-row">
                    <span className="info-label">Nama Pemilik</span>
                    <span className="info-value">{saldoInfo.nama}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Nomor Rekening</span>
                    <span className="info-value">{saldoInfo.noRekening}</span>
                  </div>
                </div>

                <div className="saldo-display">
                  <h3 className="section-title">
                    <span className="section-icon">💳</span>
                    Saldo Tersedia
                  </h3>
                  <div className="saldo-amount">
                    <span className="currency">Rp</span>
                    <span className="amount">{formatCurrency(saldoInfo.saldo).replace('Rp ', '')}</span>
                  </div>
                  <div className="last-update">
                    <span className="update-icon">🕒</span>
                    <span>Terakhir diperbarui: {new Date(saldoInfo.lastUpdate).toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Back Button */}
          <button 
            className="back-button" 
            onClick={() => navigate('/user/minfo')}
          >
            <span className="back-icon">←</span>
            <span>Kembali ke M-Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoSaldo;
