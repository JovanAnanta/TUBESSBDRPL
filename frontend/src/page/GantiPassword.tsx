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

        const response = await fetch('/api/user/ganti-password', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ oldPassword, newPassword }),
        });

        const data = await response.json();

        if (!response.ok) {
            setError(data.message || 'Gagal mengganti password');
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
    };

    return (
        <div className="ganti-password-container">
        <button
            className="back-button"
            onClick={() => navigate('/user')}
        >
            ← Kembali
        </button>

        <h2>Ganti Password</h2>
        <form onSubmit={handleSubmit} className="ganti-password-form">
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <label>Password Lama</label>
            <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            />

            <label>Password Baru</label>
            <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            />

            <label>Konfirmasi Password Baru</label>
            <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            />

            <button type="submit">Ganti Password</button>
        </form>
        </div>
    );
    };

    export default GantiPassword;
