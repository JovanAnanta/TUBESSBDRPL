import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Tagihan.css';

    export const TagihanAir = () => {
    const [formData, setFormData] = useState({
        nomorTagihan: '',
        jumlahBayar: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/tagihan/air', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Pembayaran gagal');

        const result = await response.json();
        alert(result.message);
        navigate('/user/mpayment');
        } catch (error) {
        alert('Gagal melakukan pembayaran');
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="tagihan-container">
        <h2 className="tagihan-title">Pembayaran Tagihan Air</h2>
        <form onSubmit={handleSubmit} className="tagihan-form">
            <div className="form-group">
            <label>Nomor Tagihan</label>
            <input
                type="text"
                value={formData.nomorTagihan}
                onChange={(e) => setFormData({...formData, nomorTagihan: e.target.value})}
                required
                placeholder="Masukkan nomor tagihan"
            />
            </div>
            <div className="form-group">
            <label>Jumlah Bayar</label>
            <input
                type="number"
                value={formData.jumlahBayar}
                onChange={(e) => setFormData({...formData, jumlahBayar: e.target.value})}
                required
                placeholder="Masukkan jumlah pembayaran"
            />
            </div>
            <button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : 'Bayar Tagihan'}
            </button>
        </form>
        </div>
    );
    };