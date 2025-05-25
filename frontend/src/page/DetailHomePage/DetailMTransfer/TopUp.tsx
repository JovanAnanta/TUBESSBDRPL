import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithPinVerification } from '../../../utils/pinUtils';

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
        }

        // Ubah nominal ke number
        const amount = Number(nominal.replace(/\./g, ''));
        if (isNaN(amount) || amount <= 0) {
            setMessage('Nominal tidak valid');
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
                    <h1 className="text-xl font-semibold text-gray-800">Top Up</h1>
                </div>

                {/* Top Up Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="nominal" className="block text-sm font-medium text-gray-700 mb-2">
                                Nominal Top Up
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    id="nominal"
                                    value={nominal}
                                    onChange={handleNominalChange}
                                    placeholder="0"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                                    required
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        {message && (
                            <div className={`mb-4 text-center ${message.includes('berhasil') ? 'text-green-600' : 'text-red-600'}`}>
                                {message}
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200"
                            disabled={loading}
                        >
                            {loading ? 'Memproses...' : 'Konfirmasi Top Up'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TopUp;