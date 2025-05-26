import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../style/EReceipt.css';

const EReceipt: React.FC = () => {
  const { transaksiId } = useParams<{ transaksiId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`/api/user/e-receipt/${transaksiId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Gagal mengambil data e-receipt');
        const result = await res.json();
        setData(result.data || result); // data: { transaksi, credit, debit, transfers }
      } catch (err: any) {
        setError(err.message || 'Terjadi kesalahan');
      }
      setLoading(false);
    };
    if (transaksiId) fetchData();
  }, [transaksiId]);
  if (loading) return <div className="ereceipt-loading">⏳ Loading...</div>;
  if (error) return <div className="ereceipt-error">❌ {error}</div>;
  if (!data) return <div className="ereceipt-not-found">📄 Data tidak ditemukan</div>;

  return (
    <div className="ereceipt-container">
      <div className="ereceipt-wrapper">
        <div className="ereceipt-card">
          <div className="ereceipt-header">
            <div className="ereceipt-icon">
              🧾
            </div>
            <h2 className="ereceipt-title">E-Receipt</h2>
            <p className="ereceipt-subtitle">Bukti Transaksi Digital</p>
          </div>
          
          <div className="ereceipt-content">
            {/* Ringkasan Transaksi */}
            <div className="ereceipt-section">
              <h3>Transaksi</h3>
              <div className="ereceipt-info-item">
                <span className="ereceipt-info-label">ID Transaksi:</span>
                <span className="ereceipt-info-value">{data.transaksi.transaksi_id}</span>
              </div>
              <div className="ereceipt-info-item">
                <span className="ereceipt-info-label">Tanggal:</span>
                <span className="ereceipt-info-value">{new Date(data.transaksi.tanggalTransaksi).toLocaleString('id-ID')}</span>
              </div>
              <div className="ereceipt-info-item">
                <span className="ereceipt-info-label">Tipe:</span>
                <span className="ereceipt-info-value">{data.transaksi.transaksiType === 'MASUK' ? '🟢 Masuk' : '🔴 Keluar'}</span>
              </div>
              <div className="ereceipt-info-item">
                <span className="ereceipt-info-label">Keterangan:</span>
                <span className="ereceipt-info-value">{data.transaksi.keterangan}</span>
              </div>
            </div>

            {/* Detail Saldo */}
            {data.credit && (
              <div className="ereceipt-section">
                <h3>Penambahan Saldo</h3>
                <div className="ereceipt-info-item">
                  <span className="ereceipt-info-label">Jumlah Masuk:</span>
                  <span className="ereceipt-info-value">Rp {Number(data.credit.jumlahSaldoBertambah).toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
            {data.debit && (
              <div className="ereceipt-section">
                <h3>Pengurangan Saldo</h3>
                <div className="ereceipt-info-item">
                  <span className="ereceipt-info-label">Jumlah Keluar:</span>
                  <span className="ereceipt-info-value">Rp {Number(data.debit.jumlahSaldoBerkurang).toLocaleString('id-ID')}</span>
                </div>
              </div>
            )}
            {data.transfers && data.transfers.length > 0 && (
              <div className="ereceipt-section">
                <h3>Detail Transfer</h3>
                <div className="ereceipt-info-item">
                  <span className="ereceipt-info-label">Dari:</span>
                  <span className="ereceipt-info-value">{data.transfers[0].fromRekening}</span>
                </div>
                <div className="ereceipt-info-item">
                  <span className="ereceipt-info-label">Ke:</span>
                  <span className="ereceipt-info-value">{data.transfers[0].toRekening}</span>
                </div>
                {data.transfers[0].berita && (
                  <div className="ereceipt-info-item">
                    <span className="ereceipt-info-label">Catatan:</span>
                    <span className="ereceipt-info-value">{data.transfers[0].berita}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="ereceipt-footer">
            <Link to="/user" className="ereceipt-back-link">
              <button className="ereceipt-back-btn">
                <span className="ereceipt-back-icon">←</span>
                <span className="ereceipt-back-text">Kembali ke Beranda</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EReceipt;
