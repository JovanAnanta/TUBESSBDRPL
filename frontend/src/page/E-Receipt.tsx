import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../style/EReceipt.css';

interface EReceiptData {
  transaksi_id: string;
  tanggalTransaksi: string;
  transaksiType: 'MASUK' | 'KELUAR';
  nominal: number;
  jenis: string;
  keterangan?: string;
  detail?: any;
}

const EReceipt: React.FC = () => {
  const { transaksiId } = useParams<{ transaksiId: string }>();
  const [data, setData] = useState<EReceiptData | null>(null);
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
        setData(result.data || result); // tergantung response backend
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
            <div className="ereceipt-info-grid">
              <div className="ereceipt-info-item">
                <span className="ereceipt-info-label">📅 Tanggal:</span>
                <span className="ereceipt-info-value">
                  {new Date(data.tanggalTransaksi).toLocaleString('id-ID')}
                </span>
              </div>
              
              <div className="ereceipt-info-item">
                <span className="ereceipt-info-label">🏷️ Jenis:</span>
                <span className="ereceipt-info-value ereceipt-jenis">
                  {data.jenis}
                </span>
              </div>
              
              <div className="ereceipt-info-item">
                <span className="ereceipt-info-label">📊 Status:</span>
                <span className={`ereceipt-info-value ereceipt-status ${data.transaksiType === 'MASUK' ? 'ereceipt-masuk' : 'ereceipt-keluar'}`}>
                  {data.transaksiType === 'MASUK' ? '📈 Masuk' : '📉 Keluar'}
                </span>
              </div>
              
              <div className="ereceipt-info-item ereceipt-nominal-item">
                <span className="ereceipt-info-label">💰 Nominal:</span>
                <span className={`ereceipt-nominal ${data.transaksiType === 'MASUK' ? 'ereceipt-nominal-masuk' : 'ereceipt-nominal-keluar'}`}>
                  {data.transaksiType === 'MASUK' ? '+' : '-'} Rp {data.nominal.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Keterangan: use detail.berita for TRANSFER, otherwise data.keterangan */}
            {(data.jenis === 'TRANSFER' ? data.detail?.berita : data.keterangan) && (
              <div className="ereceipt-keterangan">
                <span className="ereceipt-info-label">💬 Keterangan:</span>
                <p className="ereceipt-keterangan-text">
                  {data.jenis === 'TRANSFER' ? data.detail.berita : data.keterangan}
                </p>
              </div>
            )}

            {/* Detail spesifik per jenis transaksi */}
            {data.detail && data.jenis.toLowerCase().includes('transfer') && (
              <div className="ereceipt-detail-section">
                <h3 className="ereceipt-detail-title">📋 Detail Transfer</h3>
                <div className="ereceipt-detail-grid">
                  <div className="ereceipt-detail-item">
                    <span className="ereceipt-detail-label">
                      {data.transaksiType === 'MASUK' ? 'Dari Rekening:' : 'Ke Rekening:'}
                    </span>
                    <span className="ereceipt-detail-value">
                      {data.transaksiType === 'MASUK' ? data.detail.fromRekening : data.detail.toRekening}
                    </span>
                  </div>
                  {data.detail.berita && (
                    <div className="ereceipt-detail-item">
                      <span className="ereceipt-detail-label">Berita:</span>
                      <span className="ereceipt-detail-value">{data.detail.berita}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {data.jenis === 'TAGIHAN' && data.detail && (
              <div className="ereceipt-detail-section">
                <h3 className="ereceipt-detail-title">📋 Detail Tagihan</h3>
                <div className="ereceipt-detail-grid">
                  <div className="ereceipt-detail-item">
                    <span className="ereceipt-detail-label">Nomor Tagihan:</span>
                    <span className="ereceipt-detail-value">{data.detail.nomorTagihan}</span>
                  </div>
                  <div className="ereceipt-detail-item">
                    <span className="ereceipt-detail-label">Tipe Tagihan:</span>
                    <span className="ereceipt-detail-value">{data.detail.statusTagihanType}</span>
                  </div>
                </div>
              </div>
            )}

            {data.jenis === 'PINJAMAN' && data.detail && (
              <div className="ereceipt-detail-section">
                <h3 className="ereceipt-detail-title">📋 Detail Pinjaman</h3>
                <div className="ereceipt-detail-grid">
                  <div className="ereceipt-detail-item">
                    <span className="ereceipt-detail-label">Jumlah per Bulan:</span>
                    <span className="ereceipt-detail-value">
                      Rp {data.detail.jumlahPerBulan?.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="ereceipt-detail-item">
                    <span className="ereceipt-detail-label">Jatuh Tempo:</span>
                    <span className="ereceipt-detail-value">
                      {new Date(data.detail.tanggalJatuhTempo).toLocaleDateString('id-ID')}
                    </span>
                  </div>
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
