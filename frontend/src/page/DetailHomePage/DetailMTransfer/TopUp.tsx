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
                {/* Header Section */}
                <div className="topup-header">
                    <div className="topup-icon">💰</div>
                    <h1 className="topup-title">Top Up Saldo</h1>
                    <p className="topup-subtitle">Tambahkan saldo ke akun Anda</p>
                </div>

                {/* Content Card */}
                <div className="topup-card">
                    {message && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            <span>{message}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="topup-form">
                        <div className="input-group">
                            <label htmlFor="nominal" className="input-label">
                                Nominal Top Up
                            </label>
                            <div className="input-field-container">
                                <span className="currency-prefix">Rp</span>
                                <input
                                    type="text"
                                    id="nominal"
                                    value={nominal}
                                    onChange={handleNominalChange}
                                    placeholder="0"
                                    className="input-field"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                        >
                            <span className="button-icon">
                                {loading ? '⏳' : '✅'}
                            </span>
                            <span className="button-text">
                                {loading ? 'Memproses...' : 'Konfirmasi Top Up'}
                            </span>
                        </button>
                    </form>
                </div>

                {/* Back Button */}
                <button
                    className="back-button"
                    onClick={() => navigate('/user/mtransfer')}
                >
                    <span className="back-icon">←</span>
                    <span>Kembali</span>
                </button>
            </div>
        </div>
    );
};

export default TopUp;