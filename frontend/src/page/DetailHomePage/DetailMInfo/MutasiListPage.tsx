import React, { useState, useEffect } from 'react';
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

  if (loading) return <div className="mutasi-container"><div className="loading">Loading...</div></div>;

  return (
    <div className="mutasi-container">
      <h2 className="page-title">Mutasi Rekening</h2>
      {error && <div className="error-message">{error}</div>}
      <div className="mutasi-section">
        <h3 className="mutasi-title">Riwayat Transaksi</h3>
        {mutasiData.length > 0 ? (
          <div className="mutasi-list">
            {mutasiData.map(item => (
              <div key={item.transaksi_id} className="mutasi-item">
                <div className="mutasi-info">
                  <div className="mutasi-date">{formatDate(item.tanggalTransaksi)}</div>
                  <div className="mutasi-description">{item.keterangan}</div>
                  <div className="mutasi-type">{item.transaksiType}</div>
                </div>
                <div className="mutasi-amount">
                  <span className={`amount ${item.transaksiType === 'KELUAR' ? 'debit' : 'credit'}`}> {item.transaksiType === 'KELUAR' ? '-' : '+'} {formatCurrency(item.nominal)}</span>
                </div>
              </div>
            ))}
            {hasMore && <div className="load-more-container"><button className="load-more-button" onClick={loadMoreData}>Muat Lebih Banyak</button></div>}
          </div>
        ) : <div className="no-mutasi"><p>Belum ada transaksi pada periode ini</p></div>}
      </div>
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/user/minfo')}>← Kembali</button>
      </div>
    </div>
  );
};

export default MutasiListPage;
