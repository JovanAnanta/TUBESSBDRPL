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
  }, [transaksiId]);  if (loading) return (
    <div className="ereceipt-container">
      <div className="ereceipt-loading">
        <div className="ereceipt-loading-spinner"></div>
        <span>Memuat E-Receipt...</span>
      </div>
    </div>
  );
  if (error) return (
    <div className="ereceipt-container">
      <div className="ereceipt-error">
        <span className="ereceipt-error-icon">❌</span>
        <span>{error}</span>
      </div>
    </div>
  );
  if (!data) return (
    <div className="ereceipt-container">
      <div className="ereceipt-not-found">
        <span className="ereceipt-not-found-icon">📄</span>
        <span>Data tidak ditemukan</span>
      </div>
    </div>
  );

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
          
          <div className="ereceipt-content">            {/* Ringkasan Transaksi */}
            <div className="ereceipt-section">
              <h3 className="ereceipt-section-title">
                <span className="ereceipt-section-icon">📋</span>
                Informasi Transaksi
              </h3>
              <div className="ereceipt-info-grid">
                <div className="ereceipt-info-item">
                  <span className="ereceipt-info-label">ID Transaksi:</span>
                  <span className="ereceipt-info-value">{data.transaksi?.transaksi_id || 'N/A'}</span>
                </div>
                <div className="ereceipt-info-item">
                  <span className="ereceipt-info-label">Tanggal:</span>
                  <span className="ereceipt-info-value">
                    {data.transaksi?.tanggalTransaksi ? 
                      new Date(data.transaksi.tanggalTransaksi).toLocaleDateString('id-ID') : 'N/A'}
                  </span>
                </div>
                <div className="ereceipt-info-item">
                  <span className="ereceipt-info-label">Tipe:</span>
                  <span className={`ereceipt-info-value ereceipt-type-badge ${data.transaksi?.transaksiType === 'MASUK' ? 'ereceipt-type-in' : 'ereceipt-type-out'}`}>
                    {data.transaksi?.transaksiType === 'MASUK' ? '🟢 Masuk' : '🔴 Keluar'}
                  </span>
                </div>
                <div className="ereceipt-info-item">
                  <span className="ereceipt-info-label">Keterangan:</span>
                  <span className="ereceipt-info-value">{data.transaksi?.keterangan || 'N/A'}</span>
                </div>
              </div>
            </div>            {/* Detail Saldo */}
            {data.credit && (
              <div className="ereceipt-section">
                <h3 className="ereceipt-section-title">
                  <span className="ereceipt-section-icon">💰</span>
                  Penambahan Saldo
                </h3>
                <div className="ereceipt-info-grid">
                  <div className="ereceipt-info-item">
                    <span className="ereceipt-info-label">Jumlah Masuk:</span>
                    <span className="ereceipt-info-value ereceipt-amount-in">
                      Rp {Number(data.credit.jumlahSaldoBertambah).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {data.debit && (
              <div className="ereceipt-section">
                <h3 className="ereceipt-section-title">
                  <span className="ereceipt-section-icon">💸</span>
                  Pengurangan Saldo
                </h3>
                <div className="ereceipt-info-grid">
                  {data.tagihan?.nomorTagihan && (
                   <div className="ereceipt-info-item">
                     <span className="ereceipt-info-label">Nomor Tagihan:</span>
                     <span className="ereceipt-info-value">{data.tagihan.nomorTagihan}</span>
                   </div>
                  )}
                  <div className="ereceipt-info-item">
                    <span className="ereceipt-info-label">Jumlah Keluar:</span>
                    <span className="ereceipt-info-value ereceipt-amount-out">
                      Rp {Number(data.debit.jumlahSaldoBerkurang).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {data.transfers && data.transfers.length > 0 && (
              <div className="ereceipt-section">
                <h3 className="ereceipt-section-title">
                  <span className="ereceipt-section-icon">🔄</span>
                  Detail Transfer
                </h3>
                <div className="ereceipt-info-grid">
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
