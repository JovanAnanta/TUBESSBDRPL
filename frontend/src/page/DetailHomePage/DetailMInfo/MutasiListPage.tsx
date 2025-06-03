import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../../style/MutasiListPage.css';

type MutasiData = {
  transaksi_id: string;
  tanggalTransaksi: string;
  transaksiType: 'MASUK' | 'KELUAR';
  nominal: number;
  keterangan: string;
  saldoSetelahTransaksi: number;
  berita?: string;
};

interface LocationState {
  startDate?: string;
  endDate?: string;
  pinVerified?: boolean;
}

const MutasiListPage: React.FC = () => {
  const [mutasiData, setMutasiData] = useState<MutasiData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nasabahId = localStorage.getItem('nasabahId');
    if (!token || !nasabahId) {
      navigate('/auth/login'); return;
    }
    const { startDate, endDate, pinVerified } = state || {};
    if (!startDate || !endDate) {
      navigate('/user/minfo/mutasi'); return;
    }
    if (!pinVerified) {
      navigate('/user/verify-pin', { state: { redirectTo: '/user/minfo/mutasi/list', data: { action: 'mutasi', startDate, endDate } } });
      return;
    }
    fetchMutasiData(startDate, endDate, token, nasabahId);
  }, [navigate, state]);

  const fetchMutasiData = async (startDate: string, endDate: string, token: string, nasabahId: string, loadMore = false) => {
    try {
      const currentOffset = loadMore ? offset : 0;
      const response = await fetch(
        `http://localhost:3000/api/user/mutasi/${nasabahId}?limit=20&offset=${currentOffset}&startDate=${startDate}&endDate=${endDate}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error('Gagal mengambil data mutasi');
      const result = await response.json();
      if (result.success) {
        setMutasiData(prev => loadMore ? [...prev, ...result.data] : result.data);
        setHasMore(result.pagination.hasMore);
        setOffset(currentOffset + result.data.length);
      } else {
        throw new Error(result.message);
      }
    } catch (err:any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreData = () => {
    const token = localStorage.getItem('token')!;
    const nasabahId = localStorage.getItem('nasabahId')!;
    const { startDate, endDate } = state as Required<LocationState>;
    fetchMutasiData(startDate!, endDate!, token, nasabahId, true);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="mutasi-container">
        <div className="mutasi-wrapper">
          <div className="loading">
            <div className="loading-spinner"></div>
            <p>Memuat mutasi...</p>
          </div>
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
          <p className="mutasi-subtitle">Riwayat transaksi periode terpilih</p>
        </div>

        {/* Content Card */}
        <div className="mutasi-card">
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {mutasiData.length > 0 ? (
            <div className="mutasi-list">
              {mutasiData.map(item => (
                <div key={item.transaksi_id} className="mutasi-item">
                  <div className="mutasi-info">
                    <div className="mutasi-date">{formatDate(item.tanggalTransaksi)}</div>
                    <div className="mutasi-description">{item.keterangan}</div>
                    <div className="mutasi-type">{item.transaksiType}</div>
                    {item.berita && <div className="mutasi-berita">{item.berita}</div>}
                  </div>
                  <div className="mutasi-amount">
                    <span className={`amount ${item.transaksiType === 'KELUAR' ? 'debit' : 'credit'}`}> {item.transaksiType === 'KELUAR' ? '-' : '+'} {formatCurrency(item.nominal)}</span>
                  </div>
                </div>
              ))}
              {hasMore && <button className="btn load-more-btn" onClick={loadMoreData}>Muat Lebih Banyak</button>}
            </div>
          ) : (
            <div className="no-mutasi"><p>Belum ada transaksi pada periode ini</p></div>
          )}

          {/* Back Button */}
          <button className="back-button" onClick={() => navigate('/user/minfo')}>
            <span className="back-icon">←</span> Kembali
          </button>
        </div>
      </div>
    </div>
  );
};

export default MutasiListPage;
