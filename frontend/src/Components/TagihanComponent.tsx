    import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TagihanType } from '../../../backend/models/Tagihan'; // Pastikan ini adalah enum, bukan model
import '../style/Tagihan.css';

    interface TagihanFormData {
    nomorTagihan: string;
    jumlahBayar: string; // masih string karena input HTML
    }

    export const TagihanComponent = () => {
    const { type } = useParams<{ type: string }>();
    const [formData, setFormData] = useState<TagihanFormData>({
        nomorTagihan: '',
        jumlahBayar: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Validasi type
    const upperType = type?.toUpperCase() as TagihanType;
    if (!upperType || !Object.values(TagihanType).includes(upperType)) {
        return <div>Invalid tagihan type</div>;
    }

    const tagihanConfig = {
        [TagihanType.AIR]: {
        title: 'Pembayaran Tagihan Air',
        nomorLabel: 'Nomor Tagihan PDAM',
        placeholder: 'Masukkan nomor tagihan PDAM',
        buttonText: 'Bayar Tagihan Air'
        },
        [TagihanType.LISTRIK]: {
        title: 'Pembayaran Tagihan Listrik',
        nomorLabel: 'Nomor Meter/ID Pelanggan PLN',
        placeholder: 'Masukkan nomor meter PLN',
        buttonText: 'Bayar Tagihan Listrik'
        }
    };

    const currentConfig = tagihanConfig[upperType];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/tagihan/${upperType.toLowerCase()}`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
            nomorTagihan: formData.nomorTagihan,
            jumlahBayar: parseFloat(formData.jumlahBayar), // konversi ke number
            })
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
        <div className={`tagihan-container ${type?.toLowerCase()}`}>
        <h2 className="tagihan-title">{currentConfig.title}</h2>
        <form onSubmit={handleSubmit} className="tagihan-form">
            <div className="form-group">
            <label>{currentConfig.nomorLabel}</label>
            <input
                type="text"
                value={formData.nomorTagihan}
                onChange={(e) => setFormData({ ...formData, nomorTagihan: e.target.value })}
                required
                placeholder={currentConfig.placeholder}
            />
            </div>
            <div className="form-group">
            <label>Jumlah Bayar</label>
            <input
                type="number"
                value={formData.jumlahBayar}
                onChange={(e) => setFormData({ ...formData, jumlahBayar: e.target.value })}
                required
                placeholder="Masukkan jumlah pembayaran"
            />
            </div>
            <button type="submit" disabled={loading}>
            {loading ? 'Memproses...' : currentConfig.buttonText}
            </button>
        </form>
        </div>
    );
    };
