import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../style/Pin.css';

interface PinInputProps {
    length?: number;
    onComplete?: (pin: string) => void;
    attempts: number;
    maxAttempts: number;
}

interface LocationState {
    redirectTo?: string;
    message?: string;
    data?: any;
}

const CekPinInput: React.FC<PinInputProps> = ({ length = 6, onComplete, attempts, maxAttempts }) => {
    const [pinArray, setPinArray] = useState<string[]>(Array(length).fill(''));
    const [isComplete, setIsComplete] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        setIsComplete(pinArray.every((digit) => digit !== ''));
    }, [pinArray]);

    useEffect(() => {
        // Clear PIN when attempts change (after wrong PIN)
        setPinArray(Array(length).fill(''));
        setIsComplete(false);
        // Focus first input
        inputsRef.current[0]?.focus();
    }, [attempts, length]);

    const setRef = (index: number) => (el: HTMLInputElement | null) => {
        inputsRef.current[index] = el;
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const newPinArray = [...pinArray];
        newPinArray[index] = value;
        setPinArray(newPinArray);

        if (value && index < length - 1) {
            inputsRef.current[index + 1]?.focus();
        }

        const pin = newPinArray.join('');
        if (pin.length === length && !newPinArray.includes('')) {
            onComplete?.(pin);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (pinArray[index] === '' && index > 0) {
                inputsRef.current[index - 1]?.focus();
            }
        }
    };

    const remainingAttempts = maxAttempts - attempts;

    return (
        <div className="pin-inputs-container">
            <div className="pin-inputs">
                {Array.from({ length }).map((_, index) => (
                    <input
                        key={index}
                        type="password"
                        maxLength={1}
                        inputMode="numeric"
                        value={pinArray[index]}
                        ref={setRef(index)}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="pin-box"
                        disabled={attempts >= maxAttempts}
                    />
                ))}
            </div>
            
            {attempts > 0 && remainingAttempts > 0 && (
                <div className="attempt-warning">
                    PIN salah! Sisa percobaan: {remainingAttempts}
                </div>
            )}
            
            {attempts >= maxAttempts && (
                <div className="blocked-message">
                    Akun Anda telah diblokir karena terlalu banyak percobaan PIN yang salah.
                </div>
            )}
        </div>
    );
};

const CekPinPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [attempts, setAttempts] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const maxAttempts = 3;
    
    // Get redirect info from location state
    const state = location.state as LocationState;
    const redirectTo = state?.redirectTo || '/user';
    const customMessage = state?.message || 'Masukkan PIN untuk melanjutkan';
    const additionalData = state?.data;

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth/login');
        }
    }, [navigate]);

    const handlePinComplete = async (pin: string) => {
        if (attempts >= maxAttempts) {
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const nasabahId = localStorage.getItem('nasabahId');

            if (!token || !nasabahId) {
                throw new Error('Token atau Nasabah ID tidak ditemukan');
            }

            // Jika aksi transfer, verifikasi PIN dan transfer bersama di server
            if (additionalData?.action === 'transfer') {
                const { toRekening, amount, note } = additionalData;
                const res = await fetch('http://localhost:3000/api/user/transfer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ nasabahId, toRekening, amount, note, pin }),
                });
                const resJson = await res.json();
                if (!res.ok) {
                    throw new Error(resJson.message || 'Transfer gagal');
                }
                const transaksiId = resJson.data.transaksi_id;
                navigate(`/user/e-receipt/${transaksiId}`);
                return;
            }
            
            // Jika aksi topup, verifikasi PIN dan top-up bersama di server
            if (additionalData?.action === 'topup') {
                const amount = additionalData.amount;
                const resTopup = await fetch('http://localhost:3000/api/user/top-up', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({ nasabahId, amount, pin }),
                });
                const resData = await resTopup.json();
                if (!resTopup.ok) {
                    throw new Error(resData.message || 'Top up gagal');
                }
                const transaksiId = resData.data.transaksi_id;
                navigate(`/user/e-receipt/${transaksiId}`);
                return;
            }
            // Jika aksi mutasi: hanya verifikasi PIN untuk melihat mutasi
            if (additionalData?.action === 'mutasi') {
                navigate(redirectTo, { state: { pinVerified: true, startDate: additionalData.startDate, endDate: additionalData.endDate } });
                setLoading(false);
                return;
            }

            // **ACTION: TAGIHAN**
            if (additionalData?.action === 'tagihan') {
                const { statusTagihanType, nomorTagihan, amount } = additionalData;
                const response = await fetch(`http://localhost:3000/api/tagihan/${statusTagihanType.toLowerCase()}`, {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                    statusTagihanType,
                    nomorTagihan,
                    jumlahBayar: amount,
                    pin
                    })
                });
                const resJson = await response.json();
                if (!response.ok) {
                    throw new Error(resJson.message || 'Pembayaran tagihan gagal');
                }
                alert('Tagihan berhasil dibayar!');
                navigate('/user/mpayment');
                return;
            }

// **ACTION: AJUKAN PINJAMAN**
if (additionalData?.action === 'ajukanPinjaman') {
    const { jumlahPinjaman, statusJatuhTempo } = additionalData;
    
    const response = await fetch("http://localhost:3000/api/pinjaman/ajukan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
            jumlahPinjaman, 
            statusJatuhTempo 
        })
    });

    const resData = await response.json();
    if (!response.ok) {
        throw new Error(resData.message || 'Gagal mengajukan pinjaman');
    }

    alert('Pengajuan pinjaman berhasil dikirim! Menunggu persetujuan admin.');
    navigate('/user/mpayment');
    return;
}

// **ACTION: BAYAR TAGIHAN PINJAMAN**
if (additionalData?.action === 'bayarTagihanPinjaman') {
    const { tagihanId, jumlahTagihan } = additionalData;
    
    const response = await fetch(`http://localhost:3000/api/pinjaman/tagihan/${tagihanId}/bayar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ id: tagihanId })
    });

    const resData = await response.json();
    if (!response.ok) {
        throw new Error(resData.message || 'Gagal membayar tagihan pinjaman');
    }

    alert('Pembayaran tagihan berhasil!');
    navigate('/user/mpayment');
    return;
}

            // Bukan aksi topup, transfer, atau mutasi: hanya verifikasi PIN
            const verifyRes = await fetch('/api/user/verifyPin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ nasabahId, pin }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
                throw new Error(verifyData.message || 'PIN salah');
            }

            // PIN benar - navigasi ke tujuan
            const stateParams = { pinVerified: true, ...(additionalData || {}) };
            navigate(redirectTo, { state: stateParams });

        } catch (err: any) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            
            if (newAttempts >= maxAttempts) {
                // Block user - bisa ditambahkan API call untuk block akun
                setError('Akun Anda telah diblokir. Silakan hubungi customer service.');
                
                // Optional: Call API to block user account
                try {
                    const token = localStorage.getItem('token');
                    const nasabahId = localStorage.getItem('nasabahId');
                    
                    await fetch('/api/user/blockAccount', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                        body: JSON.stringify({ nasabahId }),
                    });
                } catch (blockError) {
                    console.error('Error blocking account:', blockError);
                }
                
                // Logout after blocking
                setTimeout(() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('nasabahId');
                    navigate('/auth/login');
                }, 3000);
            } else {
                setError(`PIN salah! Sisa percobaan: ${maxAttempts - newAttempts}`);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/user');
    };

    return (
        <div className="pin-container">
            <div className="pin-header">
                <h2>Verifikasi PIN</h2>
                <p className="pin-message">{customMessage}</p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <CekPinInput
                length={6}
                onComplete={handlePinComplete}
                attempts={attempts}
                maxAttempts={maxAttempts}
            />

            <div className="pin-actions">
                {loading && (
                    <div className="loading-message">
                        Memverifikasi PIN...
                    </div>
                )}
                
                {attempts < maxAttempts && (
                    <button 
                        className="cancel-button" 
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Batal
                    </button>
                )}
            </div>
        </div>
    );
};

export default CekPinPage;