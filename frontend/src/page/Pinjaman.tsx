import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Pinjaman.css";

interface PinjamanData {
  pinjaman_id?: string;
  transaksi_id?: string;
  statusJatuhTempo: "6BULAN" | "12BULAN" | "24BULAN";
  jumlahPinjaman: number;
  tanggalJatuhTempo?: string; // otomatis di backend
}

export const PinjamanPage = () => {
  const [pinjamans, setPinjamans] = useState<PinjamanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // jumlahPinjaman bisa number atau string kosong untuk input yang bisa dikosongkan
  const [formData, setFormData] = useState<{ statusJatuhTempo: string; jumlahPinjaman: number | "" }>({
    statusJatuhTempo: "6BULAN",
    jumlahPinjaman: 0,
  });

  useEffect(() => {
    fetch("http://localhost:3000/api/pinjaman")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setPinjamans(data);
        } else {
          setError("Data pinjaman tidak berbentuk array.");
        }
      })
      .catch(() => setError("Gagal mengambil data pinjaman."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "jumlahPinjaman") {
      // Jika input kosong, set string kosong supaya bisa dikosongkan
      if (value === "") {
        setFormData(prev => ({
          ...prev,
          jumlahPinjaman: "",
        }));
      } else {
        // Jika ada input, konversi ke number dan pastikan minimal 0
        const numValue = Number(value);
        setFormData(prev => ({
          ...prev,
          jumlahPinjaman: numValue >= 0 ? numValue : 0,
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const nasabah_id = localStorage.getItem("nasabahId");
    if (!nasabah_id) {
      setError("Nasabah ID tidak ditemukan. Silakan login terlebih dahulu.");
      return;
    }

    const submitData = {
      pinjaman: {
        statusJatuhTempo: formData.statusJatuhTempo,
        jumlahPinjaman: formData.jumlahPinjaman === "" ? 0 : formData.jumlahPinjaman,
      },
      transaksi: {
        nasabah_id: nasabah_id,
        transaksiType: "KELUAR",
        tanggalTransaksi: new Date(),
      },
    };

    fetch("http://localhost:3000/api/pinjaman", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Gagal membuat pinjaman");
        }
        return res.json();
      })
      .then((data) => {
        setPinjamans((prev) => [...prev, data.pinjaman]);
        setFormData({
          statusJatuhTempo: "6BULAN",
          jumlahPinjaman: 0,
        });
      })
      .catch((err) => setError(err.message));
  };



  if (loading) return <p>Loading...</p>;

  return (
    <div className="pinjaman-container">
      <h1>Daftar Pinjaman</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <div>
          <label>Lama Tempo Bayar:</label><br />
          <select
            name="statusJatuhTempo"
            value={formData.statusJatuhTempo}
            onChange={handleChange}
            required
          >
            <option value="6BULAN">6 Bulan</option>
            <option value="12BULAN">12 Bulan</option>
            <option value="24BULAN">24 Bulan</option>
          </select>
        </div>

        <div>
          <label>Jumlah Per Bulan:</label><br />
          <input
            type="number"
            name="jumlahPinjaman"
            value={formData.jumlahPinjaman}
            onChange={handleChange}
            placeholder="Masukkan jumlah per bulan"
            min={0}
            step={1}
          />
        </div>

        <button type="submit" style={{ marginTop: 10 }}>
          Tambah Pinjaman
        </button>
      </form>
      <button
            className="tagihan-back-button"
            onClick={() => navigate('/user/mpayment')}
        >
            Kembali
        </button>

      <ul>
        {pinjamans.map((p) => (
          <li key={p.pinjaman_id}>
            {p.pinjaman_id} - {p.statusJatuhTempo} - {p.jumlahPinjaman} - {p.tanggalJatuhTempo}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default PinjamanPage;
