import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../style/Pinjaman.css"; // Import your CSS styles

interface TagihanPinjaman {
  tagihan_id: string;
  pinjaman_id: string;
  tanggalTagihan: string;
  jumlahTagihan: number;
  status: "BELUM_BAYAR" | "LUNAS";
}

interface Pinjaman {
  pinjaman_id: string;
  jumlahPinjaman: number;
  statusJatuhTempo: string;
  statusPinjaman: "PENDING" | "ACCEPTED" | "REJECTED";
  claimed?: boolean; // ✅ Tambahkan property ini saja
}

const tenorOptions = [
  { value: "6BULAN", label: "6 Bulan", interest: "3%" },
  { value: "12BULAN", label: "12 Bulan", interest: "3%" },
  { value: "24BULAN", label: "24 Bulan", interest: "3%" },
];

const PinjamanPage: React.FC = () => {
  const [jumlahPinjaman, setJumlahPinjaman] = useState("");
  const [tenor, setTenor] = useState("");
  const [tagihanList, setTagihanList] = useState<TagihanPinjaman[]>([]);
  const [pinjaman, setPinjaman] = useState<Pinjaman | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [notif, setNotif] = useState<{ show: boolean; message: string; type: string }>({
    show: false,
    message: "",
    type: "success",
  });
  const navigate = useNavigate();

  // Fetch tagihan dan status pinjaman
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotification("Token tidak ditemukan, silakan login ulang", "error");
        return;
      }
      
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch tagihan dan status pinjaman bersamaan dengan better error handling
      const [tagihanRes, pinjamanRes] = await Promise.all([
        axios.get("/api/pinjaman/tagihan", { headers }).catch(err => {
          console.log("Tagihan API Error:", err.response?.status, err.response?.data);
          if (err.response?.status === 401) {
            showNotification("Sesi berakhir, silakan login ulang", "error");
          }
          return { data: { data: [] } };
        }),
        axios.get("/api/pinjaman/status", { headers }).catch(err => {
          console.log("Status API Error:", err.response?.status, err.response?.data);
          if (err.response?.status === 401) {
            showNotification("Sesi berakhir, silakan login ulang", "error");
          }
          return { data: { data: null } };
        })
      ]);

      setTagihanList(tagihanRes.data.data || []);
      
      if (pinjamanRes.data.data) {
        setPinjaman(pinjamanRes.data.data);
        setHasClaimed(pinjamanRes.data.data.claimed || false);
      } else {
        setPinjaman(null);
        setHasClaimed(false);
      }
    } catch (err: any) {
      console.error("Unexpected error in fetchData:", err);
      showNotification("Terjadi kesalahan saat memuat data", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotification = (message: string, type: string) => {
    setNotif({ show: true, message, type });
    setTimeout(() => {
      setNotif({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleAjukan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input
    if (!jumlahPinjaman || !tenor) {
      showNotification("Lengkapi semua data pinjaman", "error");
      return;
    }
    
    if (Number(jumlahPinjaman) < 1000000) {
      showNotification("Jumlah pinjaman minimal Rp 1.000.000", "error");
      return;
    }

    setConfirmDialog(false);
    setLoading(true);
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/pinjaman/ajukan",
        { jumlahPinjaman: Number(jumlahPinjaman), statusJatuhTempo: tenor },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showNotification("Pengajuan pinjaman berhasil! Menunggu konfirmasi admin", "success");
      
      setJumlahPinjaman("");
      setTenor("");
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Gagal mengajukan pinjaman", "error");
    }
    
    setLoading(false);
  };

  const handleBayar = async (tagihan_id: string) => {
    if (!hasClaimed) {
      showNotification("Anda harus menclaim pinjaman terlebih dahulu sebelum membayar", "warning");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/api/pinjaman/tagihan/${tagihan_id}/bayar`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showNotification("Pembayaran berhasil!", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Gagal membayar tagihan", "error");
    }
    setLoading(false);
  };

  const handleClaim = async (pinjaman_id: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `/api/pinjaman/claim/${pinjaman_id}`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setHasClaimed(true);
      showNotification(res.data.message || "Berhasil klaim pinjaman! Saldo Anda bertambah", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.response?.data?.message || "Gagal klaim pinjaman", "error");
    }
    setLoading(false);
  };

  const angsuranPerbulan = () => {
    if (!jumlahPinjaman || !tenor) return 0;
    
    const bulan = tenor === "6BULAN" ? 6 : tenor === "12BULAN" ? 12 : 24;
    const pokok = Number(jumlahPinjaman) / bulan;
    const bunga = Number(jumlahPinjaman) * 0.03; // Bunga flat 3%
    
    return pokok + bunga;
  };

  // Pengecekan apakah ada pinjaman aktif (PENDING atau ACCEPTED)
  const hasPendingOrActive = pinjaman && ["PENDING", "ACCEPTED"].includes(pinjaman.statusPinjaman);

  // Grup tagihan per pinjaman
  const groupedTagihan = tagihanList.reduce<Record<string, TagihanPinjaman[]>>((acc, tagihan) => {
    if (!acc[tagihan.pinjaman_id]) {
      acc[tagihan.pinjaman_id] = [];
    }
    acc[tagihan.pinjaman_id].push(tagihan);
    return acc;
  }, {});

  // Helper untuk stepper
  function getActiveStep(): number {
    if (!pinjaman) return 0;
    if (pinjaman.statusPinjaman === "PENDING") return 1;
    if (pinjaman.statusPinjaman === "REJECTED") return 1;
    if (pinjaman.statusPinjaman === "ACCEPTED" && !hasClaimed) return 2;
    return 3;
  }

  // Format currency Indonesia
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <div className="pinjaman-container">
      <div className="pinjaman-wrapper">
        <div className="pinjaman-header">
          <div className="pinjaman-icon">💰</div>
          <h1 className="pinjaman-title">Layanan Pinjaman</h1>
          <p className="pinjaman-subtitle">Solusi finansial terpercaya untuk kebutuhan Anda</p>
        </div>

        {/* Form Ajukan Pinjaman */}
        {!hasPendingOrActive ? (
          <div className="pinjaman-card new-loan">
            <div className="card-header">
              <h2 className="card-title">
                <span className="card-icon">📋</span>
                Ajukan Pinjaman Baru
              </h2>
              <p className="card-subtitle">Isi formulir di bawah untuk mengajukan pinjaman</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); setConfirmDialog(true); }} className="pinjaman-form">
              <div className="form-grid">
                <div className="form-column">
                  <div className="form-group">
                    <label htmlFor="jumlahPinjaman" className="form-label">
                      <span className="label-icon">💵</span>
                      Jumlah Pinjaman
                    </label>
                    <input
                      id="jumlahPinjaman"
                      type="number"
                      className="form-input"
                      value={jumlahPinjaman}
                      onChange={(e) => setJumlahPinjaman(e.target.value)}
                      required
                      min="1000000"
                      step="100000"
                      placeholder="Minimal Rp 1.000.000"
                    />
                    <small className="form-hint">Minimal Rp 1.000.000</small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="tenor" className="form-label">
                      <span className="label-icon">📅</span>
                      Tenor Pinjaman
                    </label>
                    <select
                      id="tenor"
                      className="form-select"
                      value={tenor}
                      onChange={(e) => setTenor(e.target.value)}
                      required
                    >
                      <option value="">Pilih Tenor</option>
                      {tenorOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label} - Bunga {opt.interest}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-column calculation-column">
                  {jumlahPinjaman && tenor && (
                    <div className="calculation-card">
                      <h3 className="calculation-title">
                        <span className="calculation-icon">🧮</span>
                        Simulasi Angsuran
                      </h3>
                      <div className="calculation-item">
                        <span className="calculation-label">Jumlah Pinjaman:</span>
                        <span className="calculation-value">Rp {formatRupiah(Number(jumlahPinjaman))}</span>
                      </div>
                      <div className="calculation-item">
                        <span className="calculation-label">Tenor:</span>
                        <span className="calculation-value">{tenor === "6BULAN" ? "6" : tenor === "12BULAN" ? "12" : "24"} Bulan</span>
                      </div>
                      <div className="calculation-item">
                        <span className="calculation-label">Bunga:</span>
                        <span className="calculation-value">3% per tahun</span>
                      </div>
                      <div className="calculation-item total">
                        <span className="calculation-label">Angsuran per Bulan:</span>
                        <span className="calculation-value highlighted">Rp {formatRupiah(angsuranPerbulan())}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <button type="submit" className="pinjaman-submit-button" disabled={loading}>
                <span className="submit-icon">📤</span>
                <span>{loading ? 'Memproses...' : 'Ajukan Pinjaman'}</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="pinjaman-card status-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="card-icon">📋</span>
                Status Pinjaman Anda
              </h2>
            </div>
            
            <div className="status-content">
              {pinjaman && (
                <><div className="status-stepper">
                    <div className={`step ${getActiveStep() >= 1 ? 'active' : ''}`}>
                      <div className="step-number">1</div>
                      <div className="step-content">
                        <div className="step-title">Pengajuan</div>
                        <div className="step-description">Pinjaman telah diajukan</div>
                      </div>
                    </div>
                    <div className={`step ${getActiveStep() >= 2 ? 'active' : ''}`}>
                      <div className="step-number">2</div>
                      <div className="step-content">
                        <div className="step-title">Persetujuan</div>
                        <div className="step-description">
                          {pinjaman.statusPinjaman === 'ACCEPTED' ? 'Disetujui' :
                            pinjaman.statusPinjaman === 'REJECTED' ? 'Ditolak' : 'Menunggu persetujuan'}
                        </div>
                      </div>
                    </div>
                    <div className={`step ${getActiveStep() >= 3 ? 'active' : ''}`}>
                      <div className="step-number">3</div>
                      <div className="step-content">
                        <div className="step-title">Pencairan</div>
                        <div className="step-description">
                          {hasClaimed ? 'Sudah dicairkan' : 'Belum dicairkan'}
                        </div>
                      </div>
                    </div>
                  </div><div className="pinjaman-details">
                      <div className="detail-item">
                        <span className="detail-label">Jumlah Pinjaman:</span>
                        <span className="detail-value">Rp {formatRupiah(pinjaman.jumlahPinjaman)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className={`detail-value status-badge ${pinjaman.statusPinjaman.toLowerCase()}`}>
                          {pinjaman.statusPinjaman === 'PENDING' ? 'Menunggu' :
                            pinjaman.statusPinjaman === 'ACCEPTED' ? 'Disetujui' : 'Ditolak'}
                        </span>
                      </div>
                      {pinjaman.statusPinjaman === 'ACCEPTED' && !hasClaimed && (
                        <button
                          className="claim-button"
                          onClick={() => handleClaim(pinjaman.pinjaman_id)}
                          disabled={loading}
                        >
                          <span className="claim-icon">💰</span>
                          <span>{loading ? 'Memproses...' : 'Cairkan Dana'}</span>
                        </button>
                      )}
                    </div></>
              )}
            </div>
          </div>
        )}

        {/* Tagihan Pinjaman */}
        {Object.keys(groupedTagihan).length > 0 && (
          <div className="pinjaman-card tagihan-card">
            <div className="card-header">
              <h2 className="card-title">
                <span className="card-icon">📊</span>
                Tagihan Pinjaman
              </h2>
            </div>
            
            <div className="tagihan-content">
              {Object.entries(groupedTagihan).map(([pinjamanId, tagihans]) => (
                <div key={pinjamanId} className="tagihan-group">
                  <h3 className="tagihan-group-title">
                    Pinjaman ID: {pinjamanId}
                  </h3>
                  <div className="tagihan-list">
                    {tagihans.map((tagihan) => (
                      <React.Fragment key={tagihan.tagihan_id}>
                        <div className="tagihan-item">
                          <div className="tagihan-info">
                            <div className="tagihan-date">
                              <span className="tagihan-label">Tanggal:</span>
                              <span className="tagihan-value">
                                {new Date(tagihan.tanggalTagihan).toLocaleDateString('id-ID')}
                              </span>
                            </div>
                            <div className="tagihan-amount">
                              <span className="tagihan-label">Jumlah:</span>
                              <span className="tagihan-value amount">
                                Rp {formatRupiah(tagihan.jumlahTagihan)}
                              </span>
                            </div>
                            <div className="tagihan-status">
                              <span className={`status-badge ${tagihan.status.toLowerCase()}`}>
                                {tagihan.status === 'BELUM_BAYAR' ? 'Belum Bayar' : 'Lunas'}
                              </span>
                            </div>
                          </div>
                          {tagihan.status === 'BELUM_BAYAR' && (
                            <button 
                              className="pay-button"
                              onClick={() => handleBayar(tagihan.tagihan_id)}
                              disabled={loading || !hasClaimed}
                            >
                              <span className="pay-icon">💳</span>
                              <span>{loading ? 'Memproses...' : 'Bayar'}</span>
                            </button>
                          )}
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading && !tagihanList.length ? (
          <div className="loading-card">
            <div className="loading-spinner"></div>
            <span>Memuat data...</span>
          </div>
        ) : tagihanList.length === 0 && Object.keys(groupedTagihan).length === 0 ? (
          <div className="empty-card">
            <div className="empty-icon">📄</div>
            <span>Belum ada tagihan pinjaman</span>
          </div>
        ) : null}

        {/* Confirmation Dialog */}
        {confirmDialog && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3 className="modal-title">
                  <span className="modal-icon">❓</span>
                  Konfirmasi Pengajuan
                </h3>
              </div>
              <div className="modal-content">
                <p>Apakah Anda yakin ingin mengajukan pinjaman dengan detail berikut?</p>
                <div className="confirmation-details">
                  <div className="confirmation-item">
                    <span>Jumlah:</span>
                    <span>Rp {formatRupiah(Number(jumlahPinjaman))}</span>
                  </div>
                  <div className="confirmation-item">
                    <span>Tenor:</span>
                    <span>{tenor === "6BULAN" ? "6" : tenor === "12BULAN" ? "12" : "24"} Bulan</span>
                  </div>
                  <div className="confirmation-item">
                    <span>Angsuran per Bulan:</span>
                    <span>Rp {formatRupiah(angsuranPerbulan())}</span>
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  className="modal-button cancel"
                  onClick={() => setConfirmDialog(false)}
                >
                  Batal
                </button>
                <button 
                  className="modal-button confirm"
                  onClick={handleAjukan}
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Ya, Ajukan'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notif.show && (
          <div className={`notification ${notif.type} slide-in`}>
            <span className="notification-icon">
              {notif.type === 'success' ? '✅' : '❌'}
            </span>
            <span className="notification-message">{notif.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotif({ ...notif, show: false })}
            >
              ×
            </button>
          </div>
        )}

        {/* Back Button */}
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span className="back-icon">←</span>
            <span>Kembali</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinjamanPage;