import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { navigateWithPinVerification } from '../../../utils/pinUtils';
import '../../../style/Transfer_new.css';

type Nasabah = {
  nasabah_id: string;
  nama: string;
  email: string;
  noRekening: string;
  saldo: number;
  profileImage: string;
  pin: string;
  kodeAkses: string;
  status: string;
};

const Transfer: React.FC = () => {
    const [nasabah, setNasabah] = useState<Nasabah | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [fromAccount, setFromAccount] = useState<string>('');
    const [toAccount, setToAccount] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [note, setNote] = useState<string>('');
    const [isValidatingAccount, setIsValidatingAccount] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const nasabahId = localStorage.getItem("nasabahId");
    
        if (token && nasabahId) {
          fetchNasabahData(token);
        } else {
          navigate('/auth/login'); // jika tidak ada token, redirect
        }
      }, []);    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsValidatingAccount(true);
        
        const token = localStorage.getItem('token');
        const nasabahId = localStorage.getItem('nasabahId');
        if (!token || !nasabahId) {
            setError('User tidak ditemukan. Silakan login ulang.');
            setIsValidatingAccount(false);
            return;
        }

        // Parse amount
        const rawAmount = Number(amount.replace(/\./g, ''));
        if (isNaN(rawAmount) || rawAmount <= 0) {
            setError('Jumlah tidak valid');
            setIsValidatingAccount(false);
            return;
        }

        // Cek saldo cukup
        if (nasabah && rawAmount > nasabah.saldo) {
            setError('Saldo tidak mencukupi');
            setIsValidatingAccount(false);
            return;
        }

        // Validasi rekening tujuan
        const isValidRecipient = await validateRecipientAccount(toAccount, token);
        if (!isValidRecipient) {
            setIsValidatingAccount(false);
            return;
        }

        setIsValidatingAccount(false);
        
        // Navigate to PIN verification before transfer
        navigateWithPinVerification(navigate, {
            redirectTo: '/user/mtransfer/transfer',
            message: 'Masukkan PIN untuk konfirmasi transfer',
            data: { action: 'transfer', toRekening: toAccount.replace(/-/g, ''), amount: rawAmount, note }
        });
    };    const fetchNasabahData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/user/getDataNasabah', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data nasabah');
      }

      const data = await response.json();
      setNasabah(data.data);
    } catch (error) {
      setError('Terjadi kesalahan saat mengambil data nasabah');
      console.error('Error:', error);
    }
  };

  const validateRecipientAccount = async (accountNumber: string, token: string): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:3000/api/user/validateAccount/${accountNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Rekening tujuan tidak ditemukan');
        } else {
          setError('Gagal memvalidasi rekening tujuan');
        }
        return false;
      }

      const data = await response.json();
      if (data.success) {
        // Cek apakah transfer ke rekening sendiri
        if (data.data.noRekening === nasabah?.noRekening) {
          setError('Tidak dapat transfer ke rekening sendiri');
          return false;
        }
        return true;
      } else {
        setError('Rekening tujuan tidak valid');
        return false;
      }
    } catch (error) {
      setError('Terjadi kesalahan saat memvalidasi rekening');
      console.error('Error:', error);
      return false;
    }
  };

  const formatAccountNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue;
};

const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};    return (
        <div className="transfer-container">
            <div className="transfer-wrapper">
                {/* Header */}
                <div className="transfer-header">
                    <Link to={"/user/mtransfer"} className="transfer-back-link">
                    <button className="transfer-back-btn">
                        <svg className="transfer-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    </Link>
                    <h1 className="transfer-title">💸 Transfer Dana</h1>
                </div>

                {/* Transfer Form */}
                <div className="transfer-card">
                    <div className="transfer-card-header">
                        <h2 className="transfer-card-title">Kirim Uang</h2>
                        <p className="transfer-card-subtitle">Transfer dengan mudah dan aman</p>
                    </div>

                    <form onSubmit={handleSubmit} className="transfer-form">
                        {/* Dari Rekening */}
                        <div className="transfer-field-group">
                            <label htmlFor="fromAccount" className="transfer-label">
                                🏦 Dari Rekening
                            </label>
                            <div className="transfer-account-display">
                                <span className="transfer-account-number">
                                    {nasabah?.noRekening || '****-****-****-****'}
                                </span>
                                <span className="transfer-balance">
                                    Saldo: Rp {nasabah?.saldo?.toLocaleString('id-ID') || '0'}
                                </span>
                            </div>
                        </div>

                        {/* Ke Rekening */}
                        <div className="transfer-field-group">
                            <label htmlFor="toAccount" className="transfer-label">
                                🎯 Ke Rekening
                            </label>
                            <input
                                type="text"
                                id="toAccount"
                                value={toAccount}
                                onChange={e => {
                                    const raw = e.target.value.replace(/\D/g, '');
                                    setToAccount(formatAccountNumber(raw));
                                }}
                                placeholder="1234567890123456"
                                className="transfer-input"
                                required
                            />
                        </div>

                        {/* Jumlah Uang */}
                        <div className="transfer-field-group">
                            <label htmlFor="amount" className="transfer-label">
                                💰 Jumlah Transfer
                            </label>
                            <div className="transfer-amount-container">
                                <span className="transfer-currency-prefix">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    id="amount"
                                    value={amount}
                                    onChange={e => {
                                        const raw = e.target.value.replace(/\D/g, '');
                                        setAmount(formatCurrency(raw));
                                    }}
                                    placeholder="0"
                                    className="transfer-amount-input"
                                    required
                                />
                            </div>
                        </div>

                        {/* Berita */}
                        <div className="transfer-field-group">
                            <label htmlFor="note" className="transfer-label">
                                💬 Berita Transfer (Opsional)
                            </label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Tambahkan catatan transfer..."
                                rows={3}
                                className="transfer-textarea"
                            />
                        </div>

                        {error && (
                            <div className="transfer-error">
                                ⚠️ {error}
                            </div>
                        )}                        <button
                            type="submit"
                            className="transfer-submit-btn"
                            disabled={isValidatingAccount}
                        >
                            <span className="transfer-btn-text">
                                {isValidatingAccount ? '🔍 Memvalidasi Rekening...' : '✅ Konfirmasi Transfer'}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Transfer;