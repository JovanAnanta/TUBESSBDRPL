import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../style/Pinjaman.css";

interface PinjamanData {
  pinjaman_id?: string;
  transaksi_id?: string;
  statusJatuhTempo: "6BULAN" | "12BULAN" | "24BULAN";
  jumlahPinjaman: number;
  tanggalJatuhTempo?: string;
  statusPinjaman: "PENDING" | "ACCEPTED" | "REJECTED";
}

export const PinjamanPage = () => {
  const [pinjamans, setPinjamans] = useState<PinjamanData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{ statusJatuhTempo: string; jumlahPinjaman: number | "" }>({
    statusJatuhTempo: "6BULAN",
    jumlahPinjaman: "",
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

  // Check if user has active pinjaman (PENDING or ACCEPTED)
  const nasabah_id = localStorage.getItem("nasabahId");
  const userActivePinjaman = pinjamans.find(
    (p) => p.statusPinjaman !== "REJECTED" && p.transaksi_id && p.statusPinjaman !== undefined
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "jumlahPinjaman") {
      if (value === "") {
        setFormData((prev) => ({
          ...prev,
          jumlahPinjaman: "",
        }));
      } else {
        const numValue = Number(value);
        setFormData((prev) => ({
          ...prev,
          jumlahPinjaman: numValue >= 0 ? numValue : 0,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nasabah_id) {
      setError("Nasabah ID tidak ditemukan. Silakan login terlebih dahulu.");
      return;
    }

    if (userActivePinjaman) {
      setError("Anda hanya dapat memiliki satu pinjaman aktif. Silakan tunggu hingga pinjaman selesai.");
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
        keterangan: "Pengajuan pinjaman",
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
          jumlahPinjaman: "",
        });
      })
      .catch((err) => setError(err.message));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="pinjaman-container">
      <h1>Daftar Pinjaman</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {userActivePinjaman ? (
        <p style={{ color: "blue" }}>
          Anda memiliki pinjaman aktif dengan status: <b>{userActivePinjaman.statusPinjaman}</b>. Anda tidak dapat mengajukan pinjaman baru sampai yang ini selesai.
        </p>
      ) : (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
          <div>
            <label>Lama Tempo Bayar:</label>
            <br />
            <select name="statusJatuhTempo" value={formData.statusJatuhTempo} onChange={handleChange} required>
              <option value="6BULAN">6 Bulan</option>
              <option value="12BULAN">12 Bulan</option>
              <option value="24BULAN">24 Bulan</option>
            </select>
          </div>

          <div>
            <label>Jumlah Pinjaman:</label>
            <br />
            <input
              type="number"
              name="jumlahPinjaman"
              value={formData.jumlahPinjaman}
              onChange={handleChange}
              placeholder="Masukkan jumlah pinjaman"
              min={1}
              step={1}
              required
            />
          </div>

          <p>
            <i>
              Bunga pinjaman: 3% per tahun <br />
              Cicilan per bulan akan dihitung secara otomatis setelah pinjaman diterima oleh admin.
            </i>
          </p>

          <button type="submit" style={{ marginTop: 10 }}>
            Ajukan Pinjaman
          </button>
        </form>
      )}

      <ul>
        {pinjamans.map((p) => (
          <li key={p.pinjaman_id}>
            <b>ID:</b> {p.pinjaman_id} | <b>Jatuh Tempo:</b> {p.statusJatuhTempo} | <b>Jumlah:</b> {p.jumlahPinjaman.toLocaleString()} | <b>Status:</b>{" "}
            <span
              style={{
                color:
                  p.statusPinjaman === "PENDING"
                    ? "orange"
                    : p.statusPinjaman === "ACCEPTED"
                    ? "green"
                    : "red",
              }}
            >
              {p.statusPinjaman}
            </span>{" "}
            | <b>Tanggal Jatuh Tempo:</b> {p.tanggalJatuhTempo ? new Date(p.tanggalJatuhTempo).toLocaleDateString() : "-"}
          </li>
        ))}
      </ul>
      <button className="tagihan-back-button" onClick={() => navigate("/user/mpayment")}>
        Kembali
      </button>
    </div>
  );
};

export default PinjamanPage;
