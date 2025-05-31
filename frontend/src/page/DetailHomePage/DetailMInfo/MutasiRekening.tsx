import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../style/MutasiRekening.css';

type MutasiData = {
  transaksi_id: string;
  tanggalTransaksi: string;
  transaksiType: 'MASUK' | 'KELUAR';
  nominal: number;
  keterangan: string;
  saldoSetelahTransaksi: number;
};

const MutasiRekening: React.FC = () => {
  const [mutasiData, setMutasiData] = useState<MutasiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { startDate, endDate, pinVerified } = location.state || {};

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nasabahId = localStorage.getItem('nasabahId');
    
    if (!token || !nasabahId) {
      navigate('/auth/login');
      return;
    }

    // Pastikan user sudah verifikasi PIN
    if (!pinVerified) {
      navigate('/user/minfo');
      return;
    }
    
    // Fetch mutasi dengan filter tanggal jika ada
    fetchMutasiData(nasabahId, token, false, startDate, endDate);
  }, [navigate, location]);

  const fetchMutasiData = async (
    nasabahId: string,
    token: string,
    loadMore = false,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      const currentOffset = loadMore ? offset : 0;
      // Build query with optional date filters
      let query = `?limit=20&offset=${currentOffset}`;
      if (startDate && endDate) {
        query += `&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`;
      }
      const response = await fetch(`/api/user/mutasi/${nasabahId}${query}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data mutasi');
      }

      const result = await response.json();
      if (result.success) {
        if (loadMore) {
          setMutasiData(prev => [...prev, ...result.data]);
        } else {
          setMutasiData(result.data);
        }
        setHasMore(result.pagination.hasMore);
        setOffset(currentOffset + result.data.length);
      } else {
        throw new Error(result.message || 'Gagal mengambil data mutasi');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil data mutasi');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = () => {
    const token = localStorage.getItem('token');
    const nasabahId = localStorage.getItem('nasabahId');
    if (token && nasabahId) {
      fetchMutasiData(nasabahId, token, true);
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
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="mutasi-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mutasi-container">
      <h2 className="page-title">Mutasi Rekening</h2>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="mutasi-section">
        <h3 className="mutasi-title">Riwayat Transaksi</h3>
        {mutasiData.length > 0 ? (
          <div className="mutasi-list">
            {mutasiData.map((item: MutasiData, index: number) => (
              <div key={item.transaksi_id} className="mutasi-item">
                <div className="mutasi-info">
                  <div className="mutasi-date">{formatDate(item.tanggalTransaksi)}</div>
                  <div className="mutasi-description">{item.keterangan}</div>
                  <div className="mutasi-type">{item.transaksiType}</div>
                </div>
                <div className="mutasi-amount">
                  <span className={`amount ${item.transaksiType === 'KELUAR' ? 'debit' : 'credit'}`}>
                    {item.transaksiType === 'KELUAR' ? '-' : '+'} {formatCurrency(item.nominal)}
                  </span>
                  <div className="saldo-after">
                    Saldo: {formatCurrency(item.saldoSetelahTransaksi)}
                  </div>
                </div>
              </div>
            ))}
            
            {hasMore && (
              <div className="load-more-container">
                <button className="load-more-button" onClick={loadMoreData}>
                  Muat Lebih Banyak
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="no-mutasi">
            <p>Belum ada transaksi</p>
          </div>
        )}
      </div>

      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/user/minfo')}>
          ← Kembali ke M-Info
        </button>
      </div>
    </div>
  );
};

export default MutasiRekening;
