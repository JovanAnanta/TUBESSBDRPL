    import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/GantiPassword.css';

    const GantiPassword: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (newPassword === oldPassword) {
            setError('Password baru tidak boleh sama dengan password lama');
            return;
        }

        if (!oldPassword || !newPassword || !confirmPassword) {
        setError('Semua field harus diisi');
        return;
        }


        if (newPassword !== confirmPassword) {
            setError('Password baru dan konfirmasi tidak cocok');
            return;
        }

        try {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Token tidak ditemukan, silakan login ulang');
            return;
        }

        const response = await fetch('/api/nasabah/ganti-password', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ oldPassword, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 401 || data.message?.toLowerCase().includes('password lama') || 
                data.message?.toLowerCase().includes('old password')) {
                setError('Password lama tidak sesuai');
            } else if (data.message?.toLowerCase().includes('tidak boleh sama')) {
                setError('Password baru tidak boleh sama dengan password lama');
            } else {
                setError(data.message || 'Gagal mengganti password');
            }
            return;
        }

        setSuccess('Password berhasil diganti!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        } catch (err) {
        setError('Terjadi kesalahan jaringan');
        console.error(err);
        }
    };    return (
        <div className="ganti-password-container">
            <div className="ganti-password-wrapper">
                <div className="ganti-password-card">
                    <div className="ganti-password-header">
                        <button
                            className="ganti-password-back-button"
                            onClick={() => navigate('/user')}
                        >
                            <span className="back-icon">←</span>
                            <span>Kembali</span>
                        </button>
                        <div className="ganti-password-title-section">
                            <div className="ganti-password-icon">🔒</div>
                            <h2 className="ganti-password-title">Ganti Password</h2>
                            <p className="ganti-password-subtitle">Perbarui password akun Anda</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="ganti-password-form">
                        {error && (
                            <div className="ganti-password-message error">
                                <span className="message-icon">⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}
                        {success && (
                            <div className="ganti-password-message success">
                                <span className="message-icon">✅</span>
                                <span>{success}</span>
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="oldPassword" className="form-label">Password Lama</label>
                            <input
                                id="oldPassword"
                                type="password"
                                className="form-input"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Masukkan password lama"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword" className="form-label">Password Baru</label>
                            <input
                                id="newPassword"
                                type="password"
                                className="form-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Masukkan password baru"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password Baru</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                className="form-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Konfirmasi password baru"
                                required
                            />
                        </div>

                        <button type="submit" className="ganti-password-submit-button">
                            <span className="submit-button-text">Ganti Password</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
    };

    export default GantiPassword;
