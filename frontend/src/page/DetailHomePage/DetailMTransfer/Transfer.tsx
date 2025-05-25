import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithPinVerification } from '../../../utils/pinUtils';

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
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const nasabahId = localStorage.getItem("nasabahId");
    
        if (token && nasabahId) {
          fetchNasabahData(token);
        } else {
          navigate('/auth/login'); // jika tidak ada token, redirect
        }
      }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const nasabahId = localStorage.getItem('nasabahId');
        if (!token || !nasabahId) {
            setError('User tidak ditemukan. Silakan login ulang.');
            return;
        }
        // Parse amount
        const rawAmount = Number(amount.replace(/\./g, ''));
        if (isNaN(rawAmount) || rawAmount <= 0) {
            setError('Jumlah tidak valid');
            return;
        }
        // Cek saldo cukup
        if (nasabah && rawAmount > nasabah.saldo) {
            setError('Saldo tidak mencukupi');
            return;
        }
        // Navigate to PIN verification before transfer
        navigateWithPinVerification(navigate, {
            redirectTo: '/user/mtransfer/transfer',
            message: 'Masukkan PIN untuk konfirmasi transfer',
            data: { action: 'transfer', toRekening: toAccount.replace(/-/g, ''), amount: rawAmount, note }
        });
    };    

    const fetchNasabahData = async (token: string) => {
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

  const formatAccountNumber = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue;
};

const formatCurrency = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="mr-4 p-2 rounded-full hover:bg-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <h1 className="text-xl font-semibold text-gray-800">Transfer</h1>
                </div>

                {/* Transfer Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Dari Rekening */}
                        <div>
                            <label htmlFor="fromAccount" className="block text-sm font-medium text-gray-700 mb-2">
                                Dari Rekening : 
                            </label>
                            <p>
                            {nasabah?.noRekening}
                            </p>
                        </div>

                        {/* Ke Rekening */}
                        <div>
                            <label htmlFor="toAccount" className="block text-sm font-medium text-gray-700 mb-2">
                                Ke Rekening
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Jumlah Uang */}
                        <div>
                            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                Jumlah Uang
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
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
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    required
                                />
                            </div>
                        </div>

                        {/* Berita (Optional) */}
                        <div>
                            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                                Berita (Opsional)
                            </label>
                            <textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Catatan transfer..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
                        >
                            Konfirmasi Transfer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Transfer;