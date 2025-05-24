    import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/GantiPin.css";

    export const GantiPin = () => {
    const [oldPin, setOldPin] = useState("");
    const [newPin, setNewPin] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
    };

    return (
        <div className="ganti-pin-container">
            <button
                className="pin-back-button"
                onClick={() => navigate('/user/settings')}
            >
                Kembali
        </button>
        <h2>Ganti PIN</h2>
        <form onSubmit={handleSubmit} className="ganti-pin-form">
            <input
            type="password"
            placeholder="PIN Lama"
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value)}
            required
            />
            <input
            type="password"
            placeholder="PIN Baru"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            required
            />
            <button type="submit" disabled={loading}>
            {loading ? "Memproses..." : "Ganti PIN"}
            </button>
            {message && <p className="ganti-pin-message">{message}</p>}
        </form>
        </div>
    );
    };
