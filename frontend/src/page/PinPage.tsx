import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../style/Pin.css';


interface PinInputProps {
    length?: number;
    onComplete?: (pin: string) => void;
}

type Nasabah = {
    nasabah_id: string;
    nama: string;
    email: string;
    noRekening: string;
    pin: string;
    saldo: number;
    kodeAkses: string;
};

const PinInput: React.FC<PinInputProps> = ({ length = 6, onComplete }) => {
    const [pinArray, setPinArray] = useState<string[]>(Array(length).fill(''));
    const navigate = useNavigate();
    const [nasabah, setNasabah] = useState<Nasabah | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);


    useEffect(() => {
        setIsComplete(pinArray.every((digit) => digit !== ''));
    }, [pinArray]);

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

    const handleSubmit = async () => {
        if (!isComplete) {
            alert('PIN belum lengkap');
            return;
        }

        const pin = pinArray.join('');
        const token = localStorage.getItem('token');

        if (!token) {
            setError('Token tidak ditemukan');
            return;
        }

        try {
            // Fetch user data
            const responseUser = await fetch('/api/user/getDataNasabah', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!responseUser.ok) {
                throw new Error('Gagal mengambil data nasabah');
            }

            const userData = await responseUser.json();
            const nasabahId = userData.data.nasabah_id;
            setNasabah(userData.data);

            localStorage.setItem('nasabahId', nasabahId);

            // Set PIN
            const responsePin = await fetch('/api/user/setPin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nasabahId,
                    pin,
                }),
            });

            if (!responsePin.ok) {
                throw new Error('Gagal menyimpan PIN');
            }

            const pinData = await responsePin.json();
            console.log('PIN berhasil disimpan:', pinData);
            navigate("/user");
            alert('PIN berhasil disimpan');
        } catch (err) {
            console.error(err);
            setError('Terjadi kesalahan saat menyimpan PIN');
        }
    };



    return (
        <div className="pin-container">
            <h2>Masukkan PIN Anda</h2>
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
                    />
                ))}
            </div>

            <button className="submit-pin" onClick={handleSubmit} disabled={!isComplete}>
                Simpan PIN
            </button>
        </div>
    );
};

export default PinInput;
