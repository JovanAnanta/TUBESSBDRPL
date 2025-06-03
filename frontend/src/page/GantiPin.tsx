    import React, { useState, useEffect, } from "react";
import { useNavigate } from "react-router-dom";
import "../style/GantiPin.css";

    export const GantiPin = () => {
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [fadeOut, setFadeOut] = useState(false);
    const navigate = useNavigate();

   useEffect(() => {
  if (message) {
    setFadeOut(false); // reset fade-out setiap kali message muncul
    const fadeTimer = setTimeout(() => {
      setFadeOut(true); // aktifkan animasi fade-out
    }, 2500); // animasi mulai setelah 2.5 detik

    const removeTimer = setTimeout(() => {
      setMessage(""); // hapus pesan setelah 3 detik
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }
}, [message]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const token = localStorage.getItem("token");

        try {
        const res = await fetch("http://localhost:3000/api/nasabah/ganti-pin", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ oldPin, newPin })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setMessage(data.message);
        setOldPin("");
        setNewPin("");
        } catch (err: any) {
        setMessage(err.message);
        } finally {
        setLoading(false);
        }
    };    return (
        <div className="ganti-pin-container">
            <div className="ganti-pin-wrapper">
                <div className="ganti-pin-card">
                    <div className="ganti-pin-header">
                        <button
                            className="ganti-pin-back-button"
                            onClick={() => navigate('/user/settings')}
                        >
                            <span className="back-icon">←</span>
                            <span>Kembali</span>
                        </button>
                        <div className="ganti-pin-title-section">
                            <div className="ganti-pin-icon">🔢</div>
                            <h2 className="ganti-pin-title">Ganti PIN</h2>
                            <p className="ganti-pin-subtitle">Perbarui PIN keamanan Anda</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="ganti-pin-form">
                        <div className="form-group">
                            <label htmlFor="oldPin" className="form-label">PIN Lama</label>
                            <input
                                id="oldPin"
                                type="password"
                                className="form-input pin-input"
                                placeholder="Masukkan PIN lama (6 digit)"
                                value={oldPin}
                                onChange={(e) => {
                                    const onlyNums = e.target.value.replace(/\D/g, "");
                                    setOldPin(onlyNums);
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                minLength={6}
                                maxLength={6}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPin" className="form-label">PIN Baru</label>
                            <input
                                id="newPin"
                                type="password"
                                className="form-input pin-input"
                                placeholder="Masukkan PIN baru (6 digit)"
                                value={newPin}
                                onChange={(e) => {
                                    const onlyNums = e.target.value.replace(/\D/g, "");
                                    setNewPin(onlyNums);
                                }}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                minLength={6}
                                maxLength={6}
                                required
                            />
                        </div>

                        {oldPin && newPin && oldPin === newPin && (
                            <div className="ganti-pin-warning">
                                <span className="warning-icon">⚠️</span>
                                <span>PIN baru harus berbeda dengan PIN lama</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="ganti-pin-submit-button"
                            disabled={loading || (!!oldPin && !!newPin && oldPin === newPin)}
                        >
                            <span className="submit-button-text">
                                {loading ? 'Memproses...' : 'Ganti PIN'}
                            </span>
                        </button>

                        {message && (
                            <div className={`ganti-pin-message ${fadeOut ? 'fade-out' : ''}`}>
                                <span className="message-icon">
                                    {message.includes('berhasil') ? '✅' : '❌'}
                                </span>
                                <span>{message}</span>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
    };
