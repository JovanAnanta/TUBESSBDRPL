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
            onChange={(e) => {
            const onlyNums = e.target.value.replace(/\D/g, ""); // remove non-digits
            setOldPin(onlyNums);
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            minLength={6}
            maxLength={6}
            required
        />
        <input
            type="password"
            placeholder="PIN Baru"
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
       
        {oldPin && newPin && oldPin === newPin && (
            <p className="ganti-pin-error">PIN baru tidak boleh sama dengan PIN lama</p>
        )}
        <button
            type="submit"
            disabled={loading || (!!oldPin && !!newPin && oldPin === newPin)}
        >
            {loading ? "Memproses..." : "Ganti PIN"}
        </button>
        {message && (
  <p className={`ganti-pin-message ${fadeOut ? "fade-out" : ""}`}>
    {message}
  </p>
)}
        </form>
        </div>
    );
    };
