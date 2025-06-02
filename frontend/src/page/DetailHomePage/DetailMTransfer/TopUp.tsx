import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { navigateWithPinVerification } from '../../../utils/pinUtils';
import '../../../style/TopUp.css';

const TopUp: React.FC = () => {
    const [nominal, setNominal] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const formatCurrency = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const formatted = rawValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');   
        setNominal(formatted);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const token = localStorage.getItem('token');
        const nasabahId = localStorage.getItem('nasabahId');
        if (!token || !nasabahId) {
            setMessage('User tidak ditemukan. Silakan login ulang.');
            setLoading(false);
            return;
        }        // Ubah nominal ke number
        const amount = Number(nominal.replace(/\./g, ''));
        if (isNaN(amount) || amount <= 0) {
            setMessage('Nominal tidak valid');
            setLoading(false);
            return;
        }

        // Validasi nominal minimum dan maksimum
        if (amount < 10000) {
            alert('Nominal harus lebih dari 10ribu');
            setLoading(false);
            return;
        }

        if (amount > 10000000) {
            alert('Top-Up tidak bisa melebihi dari 10juta');
            setLoading(false);
            return;
        }

        // Redirect to PIN verification before performing top-up
        setLoading(false);
        navigateWithPinVerification(navigate, {
            redirectTo: '/user',
            message: 'Masukkan PIN untuk konfirmasi Top Up',
            data: { action: 'topup', amount }
        });
        return;
    };    return (
        <div className="topup-container">
            <div className="topup-wrapper">
                {/* Header */}
                <div className="topup-header">

            <Link to="/user/mtransfer" className="topup-back-link">
                <button className="topup-back-btn">
                    <svg className="topup-back-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </Link>
                    <h1 className="topup-title">💰 Top Up Saldo</h1>
                </div>

                {/* Top Up Form */}
                <div className="topup-card">
                    <div className="topup-card-header">
                        <h2 className="topup-card-title">Isi Saldo Anda</h2>
                        <p className="topup-card-subtitle">Masukkan nominal yang ingin ditambahkan</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="topup-form">
                        <div className="topup-input-group">
                            <label htmlFor="nominal" className="topup-label">
                                💵 Nominal Top Up
                            </label>
                            <div className="topup-input-container">
                                <span className="topup-currency-prefix">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    id="nominal"
                                    value={nominal}
                                    onChange={handleNominalChange}
                                    placeholder="0"
                                    className="topup-input"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        
                        {message && (
                            <div className={`topup-message ${message.includes('berhasil') ? 'topup-success' : 'topup-error'}`}>
                                {message}
                            </div>
                        )}
                        
                        <button
                            type="submit"
                            className={`topup-submit-btn ${loading ? 'topup-loading' : ''}`}
                            disabled={loading}
                        >
                            <span className="topup-btn-text">
                                {loading ? '⏳ Memproses...' : '✅ Konfirmasi Top Up'}
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TopUp;