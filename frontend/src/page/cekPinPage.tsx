import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

            const response = await fetch('/api/user/verifyPin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    nasabahId,
                    pin,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'PIN salah');
            }

            // PIN benar - navigate ke tujuan
            // Always include pinVerified flag and any additional data when navigating after PIN success
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