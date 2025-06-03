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
  berita?: string;
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
        <div className="mutasi-wrapper">
          <div className="loading"><div className="loading-spinner"></div><p>Memuat mutasi...</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mutasi-container">
      <div className="mutasi-wrapper">
        {/* Header Section */}
        <div className="mutasi-header">
          <div className="mutasi-icon">📊</div>
          <h1 className="mutasi-title">Mutasi Rekening</h1>
          <p className="mutasi-subtitle">Riwayat transaksi akun Anda</p>
        </div>

        {/* Content Card */}
        <div className="mutasi-card">
          {error && <div className="error-message"><span className="error-icon">⚠️</span><span>{error}</span></div>}
          <div className="mutasi-list">
            {mutasiData.length > 0 ? (
              mutasiData.map((item: MutasiData, index: number) => (
                <div key={item.transaksi_id} className="mutasi-item">
                  <div className="mutasi-info">
                    <div className="mutasi-date">{formatDate(item.tanggalTransaksi)}</div>
                    <div className="mutasi-description">{item.keterangan}</div>
                    {item.berita && <div className="mutasi-berita">📝 {item.berita}</div>}
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
              ))
            ) : (
              <div className="no-mutasi">
                <p>Belum ada transaksi</p>
              </div>
            )}
          </div>
          {hasMore && <button className="btn load-more-btn" onClick={loadMoreData}>Muat Lebih Banyak</button>}

          {/* Back Button */}
          <button className="back-button" onClick={() => navigate('/user/minfo')}>
            <span className="back-icon">←</span> Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default MutasiRekening;
