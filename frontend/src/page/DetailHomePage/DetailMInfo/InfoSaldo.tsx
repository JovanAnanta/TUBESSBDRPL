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
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="info-saldo-container">
      <h2 className="page-title">Info Saldo</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {saldoInfo && (
        <div className="saldo-card">
          <div className="saldo-header">
            <h3>Informasi Rekening</h3>
            <div className="account-info">
              <p className="account-name">{saldoInfo.nama}</p>
              <p className="account-number">{saldoInfo.noRekening}</p>
            </div>
          </div>
          <div className="saldo-amount">
            <span className="saldo-label">Saldo Tersedia</span>
            <span className="saldo-value">{formatCurrency(saldoInfo.saldo)}</span>
          </div>
        </div>
      )}

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/user/minfo')}>
          ← Kembali ke M-Info
        </button>
      </div>
    </div>
  );
};

export default InfoSaldo;
