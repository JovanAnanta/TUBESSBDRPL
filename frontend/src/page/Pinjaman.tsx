import React, { useEffect, useState } from "react";
import axios from "axios";
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

  // Fetch tagihan dan status pinjaman
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch tagihan dan status pinjaman bersamaan
      const [tagihanRes, pinjamanRes] = await Promise.all([
        axios.get("/api/pinjaman/tagihan", { headers }),
        axios.get("/api/pinjaman/status", { headers }),
      ]);

      setTagihanList(tagihanRes.data.data || []);
      
      if (pinjamanRes.data.data) {
        setPinjaman(pinjamanRes.data.data);
        setHasClaimed(pinjamanRes.data.data.claimed || false);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      if (err.response?.status !== 404) {
        showNotification(err.response?.data?.message || "Gagal memuat data", "error");
      }
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
      <h1 className="pinjaman-title">
        <span className="icon">💰</span> Pinjaman
      </h1>

      {/* Form Ajukan Pinjaman */}
      {!hasPendingOrActive ? (
        <div className="pinjaman-card new-loan">
          <h2>Ajukan Pinjaman Baru</h2>
          
          <form onSubmit={(e) => { e.preventDefault(); setConfirmDialog(true); }}>
            <div className="form-grid">
              <div className="form-column">
                <div className="form-group">
                  <label htmlFor="jumlahPinjaman">Jumlah Pinjaman</label>
                  <input
                    id="jumlahPinjaman"
                    type="number"
                    value={jumlahPinjaman}
                    onChange={(e) => setJumlahPinjaman(e.target.value)}
                    required
                    min="1000000"
                    step="100000"
                    placeholder="Minimal Rp 1.000.000"
                  />
                  <small>Minimal Rp 1.000.000</small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="tenor">Tenor</label>
                  <select
                    id="tenor"
                    value={tenor}
                    onChange={(e) => setTenor(e.target.value)}
                    required
                  >
                    <option value="">Pilih Tenor</option>
                    {tenorOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label} (Bunga: {opt.interest})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-column">
                {(jumlahPinjaman && tenor) ? (
                  <div className="simulasi-box">
                    <h3>Simulasi Pinjaman</h3>
                    
                    <div className="simulasi-item">
                      <span>Jumlah Pinjaman:</span>
                      <span className="highlight">Rp {formatRupiah(Number(jumlahPinjaman))}</span>
                    </div>
                    
                    <div className="simulasi-item">
                      <span>Bunga:</span>
                      <span className="highlight">3% (flat)</span>
                    </div>
                    
                    <div className="simulasi-item">
                      <span>Tenor:</span>
                      <span className="highlight">
                        {tenor === "6BULAN" ? "6 Bulan" : tenor === "12BULAN" ? "12 Bulan" : "24 Bulan"}
                      </span>
                    </div>
                    
                    <div className="divider"></div>
                    
                    <div className="simulasi-total">
                      <span>Angsuran per bulan:</span>
                      <span className="total-amount">Rp {formatRupiah(angsuranPerbulan())}</span>
                    </div>
                  </div>
                ) : (
                  <div className="simulasi-empty">
                    <p>Masukkan jumlah pinjaman dan tenor untuk melihat simulasi</p>
                  </div>
                )}
              </div>
            </div>
            
            <button 
              className="btn-primary full-width"
              type="submit"
              disabled={loading || !jumlahPinjaman || !tenor}
            >
              {loading ? "Memproses..." : "Ajukan Pinjaman"}
            </button>
          </form>
        </div>
      ) : (
        <div className="pinjaman-card pending-loan">
          <div className="card-header">
            <span className="status-icon">⏳</span>
            <h2>Pinjaman Sedang Diproses</h2>
          </div>
          
          <p className="note">
            Anda sudah memiliki pinjaman yang {pinjaman?.statusPinjaman === "PENDING" ? "sedang diproses" : "aktif"}.
            Tidak dapat mengajukan pinjaman baru hingga pinjaman selesai.
          </p>
          
          {pinjaman && (
            <div className="pinjaman-details">
              <div className="pinjaman-info">
                <div className="info-item">
                  <span className="label">Jumlah Pinjaman:</span>
                  <span className="value">Rp {formatRupiah(pinjaman.jumlahPinjaman)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tenor:</span>
                  <span className="value">
                    {pinjaman.statusJatuhTempo === "6BULAN" ? "6 Bulan" 
                     : pinjaman.statusJatuhTempo === "12BULAN" ? "12 Bulan" 
                     : "24 Bulan"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className={`status-badge ${pinjaman.statusPinjaman.toLowerCase()}`}>
                    {pinjaman.statusPinjaman === "ACCEPTED" ? "Disetujui" : "Menunggu Persetujuan"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Pinjaman & Step */}
      {pinjaman && pinjaman.statusPinjaman && (
        <div className="pinjaman-card loan-status">
          <h2>Status Pinjaman</h2>
          
          <div className="stepper">
            <div className={`step ${getActiveStep() >= 0 ? "active" : ""}`}>
              <div className="step-icon">1</div>
              <div className="step-label">Pengajuan</div>
            </div>
            <div className="connector"></div>
            <div className={`step ${getActiveStep() >= 1 ? "active" : ""}`}>
              <div className="step-icon">2</div>
              <div className="step-label">Persetujuan Admin</div>
            </div>
            <div className="connector"></div>
            <div className={`step ${getActiveStep() >= 2 ? "active" : ""}`}>
              <div className="step-icon">3</div>
              <div className="step-label">Pencairan Dana</div>
            </div>
            <div className="connector"></div>
            <div className={`step ${getActiveStep() >= 3 ? "active" : ""}`}>
              <div className="step-icon">4</div>
              <div className="step-label">Pembayaran Cicilan</div>
            </div>
          </div>
          
          {pinjaman.statusPinjaman === "ACCEPTED" && !hasClaimed && (
            <button 
              className="btn-success full-width"
              onClick={() => handleClaim(pinjaman.pinjaman_id)}
              disabled={loading}
            >
              {loading ? "Memproses..." : "✓ Klaim Pinjaman Sekarang"}
            </button>
          )}
        </div>
      )}

      {/* Daftar Tagihan */}
      <div className="section-divider"></div>
      <div className="section-header">
        <span className="icon">📅</span>
        <h2>Daftar Tagihan Pinjaman</h2>
      </div>

      {loading && !tagihanList.length ? (
        <div className="loading-spinner"><div></div><div></div><div></div><div></div></div>
      ) : tagihanList.length === 0 ? (
        <div className="empty-state">
          <p>Belum ada tagihan pinjaman.</p>
          <small>
            {pinjaman?.statusPinjaman === "PENDING" 
              ? "Pinjaman Anda sedang menunggu persetujuan admin." 
              : "Ajukan pinjaman baru untuk memulai."}
          </small>
        </div>
      ) : (
        <div className="tagihan-container">
          {/* Iterate through grouped tagihan */}
          {Object.entries(groupedTagihan).map(([pinjaman_id, tagihanGroup]) => {
            // Sort by date
            const sortedTagihan = [...tagihanGroup].sort(
              (a, b) => new Date(a.tanggalTagihan).getTime() - new Date(b.tanggalTagihan).getTime()
            );
            
            return (
              <div key={pinjaman_id} className="tagihan-group">
                <div className="tagihan-header">
                  <span className="icon">🏦</span>
                  <h3>Cicilan Pinjaman</h3>
                </div>
                
                <div className="tagihan-grid">
                  {sortedTagihan.map((tagihan, index) => {
                    const dueDate = new Date(tagihan.tanggalTagihan);
                    const isOverdue = tagihan.status === "BELUM_BAYAR" && dueDate < new Date();
                    
                    return (
                      <div 
                        key={tagihan.tagihan_id} 
                        className={`tagihan-card ${tagihan.status === "LUNAS" 
                          ? "paid" 
                          : isOverdue 
                            ? "overdue" 
                            : "unpaid"}`}
                      >
                        {isOverdue && <div className="overdue-badge">TERLAMBAT</div>}
                        <div className="tagihan-header">
                          <h4>Cicilan #{index + 1}</h4>
                          <span className={`status-pill ${tagihan.status === "LUNAS" ? "paid" : "unpaid"}`}>
                            {tagihan.status === "LUNAS" ? "Lunas" : "Belum Bayar"}
                          </span>
                        </div>
                        
                        <div className="tagihan-detail">
                          <div className="detail-label">Jatuh Tempo:</div>
                          <div className="detail-value">
                            {dueDate.toLocaleDateString("id-ID", {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                        
                        <div className="tagihan-detail">
                          <div className="detail-label">Jumlah:</div>
                          <div className="detail-value amount">
                            Rp {formatRupiah(tagihan.jumlahTagihan)}
                          </div>
                        </div>

                        {tagihan.status === "BELUM_BAYAR" && (
                          <button
                            className="btn-success"
                            onClick={() => handleBayar(tagihan.tagihan_id)}
                            disabled={loading || !hasClaimed}
                          >
                            {loading ? "Memproses..." : "Bayar Sekarang"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {!hasClaimed && pinjaman?.statusPinjaman === "ACCEPTED" && (
                  <div className="alert warning">
                    ⚠️ Anda harus menclaim pinjaman terlebih dahulu sebelum membayar cicilan
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog Konfirmasi */}
      {confirmDialog && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Konfirmasi Pengajuan Pinjaman</h3>
            <div className="modal-content">
              <p>Anda akan mengajukan pinjaman dengan detail berikut:</p>
              <div className="confirmation-details">
                <div className="detail-item">
                  <span>Jumlah:</span>
                  <span><b>Rp {formatRupiah(Number(jumlahPinjaman))}</b></span>
                </div>
                <div className="detail-item">
                  <span>Tenor:</span>
                  <span><b>{tenor === "6BULAN" ? "6 Bulan" : tenor === "12BULAN" ? "12 Bulan" : "24 Bulan"}</b></span>
                </div>
                <div className="detail-item">
                  <span>Angsuran per bulan:</span>
                  <span><b>Rp {formatRupiah(angsuranPerbulan())}</b></span>
                </div>
              </div>
              <div className="alert info">
                ℹ️ Pengajuan ini akan diproses oleh admin. Setelah disetujui, Anda harus menclaim pinjaman untuk menambahkan dana ke saldo Anda.
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setConfirmDialog(false)}
              >
                Batalkan
              </button>
              <button 
                className="btn-primary" 
                onClick={handleAjukan}
                disabled={loading}
              >
                {loading ? "Memproses..." : "Ajukan Pinjaman"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notif.show && (
        <div className={`notification ${notif.type}`}>
          {notif.message}
        </div>
      )}
    </div>
  );
};

export default PinjamanPage;