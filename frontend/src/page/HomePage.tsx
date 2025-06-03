import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../style/HomePage.css";
import "../style/Report.css";
import ReportForm from "./ReportForm";

type Nasabah = {
  nasabah_id: string;
  nama: string;
  email: string;
  noRekening: string;
  saldo: number;
  profileImage: string;
  pin: string;
  kodeAkses: string;
  status: string;
};

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [showReportForm, setShowReportForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const nasabahId = localStorage.getItem("nasabahId");

    if (!token || !nasabahId) {
      navigate("/auth/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nasabahId");
    navigate("/auth/login");
  };

  const features = [
    { name: "M-Info", icon: "ℹ️", path: "/user/minfo" },
    { name: "M-Transfer", icon: "💸", path: "/user/mtransfer" },
    { name: "M-Payment", icon: "💳", path: "/user/mpayment" },
    { name: "Account Settings", icon: "⚙️", path: "/user/settings" },
  ];  return (
    <div className="homepage-container">
      <div className="homepage-wrapper">
        <div className="homepage-header">
          <div className="homepage-welcome">
            <div className="homepage-icon">🏦</div>
            <h2 className="homepage-title">Selamat Datang di BCA Mobile</h2>
            <p className="homepage-subtitle">Nikmati kemudahan perbankan digital</p>
          </div>
        </div>

        <div className="homepage-content">
          <div className="features-section">
            <h3 className="features-title">
              <span className="features-icon">⚡</span>
              Layanan Utama
            </h3>
            <div className="features-grid">
              {features.map((feature, index) => (
                <Link to={feature.path} key={index} className="feature-link">
                  <div className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <div className="feature-label">{feature.name}</div>
                    <div className="feature-arrow">→</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="logout-section">
            <div className="feature-link logout-link" onClick={handleLogout}>
              <div className="feature-card logout-card">
                <div className="feature-icon">🚪</div>
                <div className="feature-label">Keluar</div>
                <div className="feature-arrow">→</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button untuk Report */}
        <button className="fab" onClick={() => setShowReportForm(true)} title="Laporkan Masalah">
          <span className="fab-icon">📝</span>
          <span className="fab-text">Report</span>
        </button>

        {/* Report Form Modal */}
        {showReportForm && (
          <ReportForm onClose={() => setShowReportForm(false)} />
        )}
      </div>
    </div>
  );
};

export default HomePage;
