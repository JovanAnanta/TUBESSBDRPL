import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { navigateWithPinVerification } from '../utils/pinUtils';
import "../style/Tagihan.css";

interface BillData {
  type: string;
  region: string;
  nomorTagihan: string;
  amount: number;
  customerName: string;
  statusTagihanType: string; // Sesuai dengan model enum: "AIR" atau "LISTRIK"
}

interface NasabahData {
  nama: string;
  noRekening: string;
  saldo: number;
  // tambah field lain sesuai kebutuhan
}

export const BillPreview = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const billData = location.state as BillData;
  const [nasabahData, setNasabahData] = useState<NasabahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNasabahData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError("Token tidak ditemukan");
          setLoading(false);
          return;
        }

        const response = await fetch('/api/user/getDataNasabah', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });        if (response.ok) {
          const response_data = await response.json();
          console.log('Full API response:', response_data);
          
          // Try different ways to access the data based on API response structure
          let nasabahInfo;
          if (response_data.data) {
            nasabahInfo = response_data.data;
          } else if (response_data.response_data && response_data.response_data.data) {
            nasabahInfo = response_data.response_data.data;
          } else {
            nasabahInfo = response_data;
          }
          
          setNasabahData(nasabahInfo);
        } else {
          setError("Gagal mengambil data nasabah");
        }
      } catch (err) {
        setError("Error saat mengambil data nasabah");
        console.error('Error fetching nasabah data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNasabahData();
  }, []);
  if (!billData) {
    return (
      <div className="bill-preview-container">
        <p>Data tagihan tidak ditemukan</p>
        <button onClick={() => navigate("/user/mpayment")}>
          Kembali ke M-Payment
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bill-preview-container">
        <h2 className="bill-preview-title">Memuat Data...</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Sedang mengambil data nasabah...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bill-preview-container">
        <h2 className="bill-preview-title">Error</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ color: 'red' }}>{error}</p>
          <button onClick={() => navigate(-1)}>Kembali</button>
        </div>
      </div>
    );
  }  const handlePayment = () => {
    // Validasi saldo sebelum pembayaran
    if (nasabahData && nasabahData.saldo < billData.amount) {
      alert(`Saldo tidak mencukupi! Saldo Anda: ${formatCurrency(nasabahData.saldo)}, Tagihan: ${formatCurrency(billData.amount)}`);
      return;
    }

    navigateWithPinVerification(navigate, {
      message: `Masukkan PIN untuk bayar tagihan ${billData.statusTagihanType}`,
      redirectTo: '/user/success',
      data: {
        action: 'tagihan',
        statusTagihanType: billData.statusTagihanType, // "AIR" atau "LISTRIK" sesuai model
        nomorTagihan: billData.nomorTagihan,
        amount: billData.amount,
        customerName: nasabahData?.nama || billData.customerName, // Gunakan nama dari API
        region: billData.region,
        transaksiType: 'KELUAR', // Sesuai dengan model Transaksi
        keterangan: `Pembayaran Tagihan ${billData.statusTagihanType} - ${billData.nomorTagihan}`
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };
  const getBillTitle = () => {
    return billData.statusTagihanType === 'AIR' ? 'Tagihan Air PDAM' : 'Tagihan Listrik PLN';
  };

  return (
    <div className="bill-preview-container">
      <h2 className="bill-preview-title">Konfirmasi Pembayaran</h2>
      
      <div className="bill-details">
        <div className="bill-header">
          <h3>{getBillTitle()}</h3>
        </div>
          <div className="bill-info">
          <div className="info-row">
            <span className="label">Jenis Tagihan:</span>
            <span className="value">{getBillTitle()}</span>
          </div>
            <div className="info-row">
            <span className="label">Nama Pelanggan:</span>
            <span className="value">{nasabahData?.nama || 'Loading...'}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Wilayah:</span>
            <span className="value">{billData.region}</span>
          </div>
          
          <div className="info-row">
            <span className="label">Nomor Tagihan:</span>
            <span className="value">{billData.nomorTagihan}</span>
          </div>

          <div className="info-row">
            <span className="label">Saldo Rekening:</span>
            <span className="value">{nasabahData ? formatCurrency(nasabahData.saldo) : 'Loading...'}</span>
          </div>
          
          <div className="info-row total">
            <span className="label">Total Tagihan:</span>
            <span className="value amount">{formatCurrency(billData.amount)}</span>
          </div>
        </div>
          <div className="payment-actions">
          <button 
            className={`pay-button ${nasabahData && nasabahData.saldo < billData.amount ? 'insufficient-funds' : ''}`}
            onClick={handlePayment}
            disabled={!nasabahData || nasabahData.saldo < billData.amount}
          >
            {!nasabahData ? 'Loading...' : 
             nasabahData.saldo < billData.amount ? 'Saldo Tidak Cukup' : 'Bayar Sekarang'}
          </button>
          
          <button 
            className="cancel-button"
            onClick={() => navigate(-1)}
          >
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
};