import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { navigateWithPinVerification } from '../../../utils/pinUtils';
import '../../../style/Transfer.css';

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
                {/* Header Section */}
                <div className="transfer-header">
                    <div className="transfer-icon">💸</div>
                    <h1 className="transfer-title">Transfer Dana</h1>
                    <p className="transfer-subtitle">Kirim uang dengan mudah dan aman</p>
                </div>

                {/* Transfer Form Card */}
                <div className="transfer-card">
                    <form onSubmit={handleSubmit} className="transfer-form">
                        {/* Account Info Section */}
                        <div className="account-info-section">
                            <h3 className="section-title">
                                <span className="section-icon">🏦</span>
                                Informasi Rekening
                            </h3>
                            <div className="from-account-display">
                                <div className="account-label">Dari Rekening</div>
                                <div className="account-number">{nasabah?.noRekening || '****-****-****-****'}</div>
                            </div>
                        </div>

                        {/* Transfer Details */}
                        <div className="transfer-details-section">
                            <h3 className="section-title">
                                <span className="section-icon">💰</span>
                                Detail Transfer
                            </h3>
                            
                            {/* Destination Account */}
                            <div className="input-group">
                                <label htmlFor="toAccount" className="input-label">
                                    <span className="label-icon">🎯</span>
                                    Rekening Tujuan
                                </label>
                                <input
                                    type="text"
                                    id="toAccount"
                                    value={toAccount}
                                    onChange={e => {
                                        const raw = e.target.value.replace(/\D/g, '');
                                        setToAccount(formatAccountNumber(raw));
                                    }}
                                    placeholder="Masukkan nomor rekening tujuan"
                                    className="input-field"
                                    required
                                />
                            </div>

                            {/* Amount */}
                            <div className="input-group">
                                <label htmlFor="amount" className="input-label">
                                    <span className="label-icon">💵</span>
                                    Jumlah Transfer
                                </label>
                                <div className="amount-input-container">
                                    <span className="currency-prefix">Rp</span>
                                    <input
                                        type="text"
                                        id="amount"
                                        value={amount}
                                        onChange={e => {
                                            const raw = e.target.value.replace(/\D/g, '');
                                            setAmount(formatCurrency(raw));
                                        }}
                                        placeholder="0"
                                        className="amount-input"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Note */}
                            <div className="input-group">
                                <label htmlFor="note" className="input-label">
                                    <span className="label-icon">💬</span>
                                    Berita Transfer (Opsional)
                                </label>
                                <textarea
                                    id="note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Tambahkan catatan untuk transfer ini..."
                                    rows={3}
                                    className="textarea-field"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="error-message">
                                <span className="error-icon">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="submit-button"
                            disabled={isValidatingAccount}
                        >
                            <span className="button-icon">
                                {isValidatingAccount ? '🔍' : '✅'}
                            </span>
                            <span className="button-text">
                                {isValidatingAccount ? 'Memvalidasi Rekening...' : 'Konfirmasi Transfer'}
                            </span>
                        </button>
                    </form>

                    {/* Back Button */}
                    <button 
                        className="back-button" 
                        onClick={() => navigate('/user/mtransfer')}
                    >
                        <span className="back-icon">←</span>
                        <span>Kembali ke M-Transfer</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Transfer;