import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

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

  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-600 mt-10">{error}</div>;
  if (!data) return <div className="text-center mt-10">Data tidak ditemukan</div>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">E-Receipt</h2>
      <div className="mb-2">Tanggal: {new Date(data.tanggalTransaksi).toLocaleString('id-ID')}</div>
      <div className="mb-2">Jenis: {data.jenis}</div>
      <div className="mb-2">
        Status: <span className={data.transaksiType === 'MASUK' ? 'text-green-600' : 'text-red-600'}>
          {data.transaksiType === 'MASUK' ? 'Masuk' : 'Keluar'}
        </span>
      </div>
      <div className="mb-2">Nominal: <span className={data.transaksiType === 'MASUK' ? 'text-green-600' : 'text-red-600'}>Rp {data.nominal.toLocaleString('id-ID')}</span></div>
      {data.keterangan && <div className="mb-2">Keterangan: {data.keterangan}</div>}
      {/* Detail spesifik per jenis transaksi */}
      {data.jenis === 'TRANSFER' && data.detail && (
        <>
          <div className="mb-2">Dari Rekening: {data.detail.noRekeningAsal}</div>
          <div className="mb-2">Ke Rekening: {data.detail.noRekeningTujuan}</div>
          <div className="mb-2">Berita: {data.detail.berita}</div>
        </>
      )}
      {data.jenis === 'TAGIHAN' && data.detail && (
        <>
          <div className="mb-2">Nomor Tagihan: {data.detail.nomorTagihan}</div>
          <div className="mb-2">Tipe Tagihan: {data.detail.statusTagihanType}</div>
        </>
      )}
      {data.jenis === 'PINJAMAN' && data.detail && (
        <>
          <div className="mb-2">Jumlah per Bulan: Rp {data.detail.jumlahPerBulan?.toLocaleString('id-ID')}</div>
          <div className="mb-2">Jatuh Tempo: {new Date(data.detail.tanggalJatuhTempo).toLocaleDateString('id-ID')}</div>
        </>
      )}
      {/* Tambahkan detail lain sesuai kebutuhan */}
    <Link to="/user" className="block text-center mt-6">
        <button>
            Kembali
        </button>
    </Link>
    </div>

  );
};

export default EReceipt;
