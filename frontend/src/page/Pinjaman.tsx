import React, { useEffect, useState } from "react";
import "../style/Pinjaman.css";

interface PinjamanData {
  pinjaman_id?: string;
  transaksi_id?: string;
  statusJatuhTempo: "6BULAN" | "12BULAN" | "24BULAN";
  jumlahPerBulan: number;
  tanggalJatuhTempo?: string; // otomatis di backend
}

export const PinjamanPage = () => {
  const [pinjamans, setPinjamans] = useState<PinjamanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // jumlahPerBulan bisa number atau string kosong untuk input yang bisa dikosongkan
  const [formData, setFormData] = useState<{ statusJatuhTempo: string; jumlahPerBulan: number | "" }>({
    statusJatuhTempo: "6BULAN",
    jumlahPerBulan: 0,
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

    if (name === "jumlahPerBulan") {
      // Jika input kosong, set string kosong supaya bisa dikosongkan
      if (value === "") {
        setFormData(prev => ({
          ...prev,
          jumlahPerBulan: "",
        }));
      } else {
        // Jika ada input, konversi ke number dan pastikan minimal 0
        const numValue = Number(value);
        setFormData(prev => ({
          ...prev,
          jumlahPerBulan: numValue >= 0 ? numValue : 0,
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

    // Jika jumlahPerBulan masih kosong, konversi ke 0 saat submitj
  const submitData = {
  statusJatuhTempo: formData.statusJatuhTempo,
  jumlahPerBulan: formData.jumlahPerBulan === "" ? 0 : formData.jumlahPerBulan,
};


    fetch("http://localhost:3000/api/pinjaman", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submitData),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Gagal membuat pinjaman");
        }
        return res.json();
      })
      .then((newPinjaman) => {
        setPinjamans((prev) => [...prev, newPinjaman]);
        setFormData({
          statusJatuhTempo: "6BULAN",
          jumlahPerBulan: 0,
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
            name="jumlahPerBulan"
            value={formData.jumlahPerBulan}
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

      <ul>
        {pinjamans.map((p) => (
          <li key={p.pinjaman_id}>
            {p.pinjaman_id} - {p.statusJatuhTempo} - {p.jumlahPerBulan} - {p.tanggalJatuhTempo}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default PinjamanPage;
