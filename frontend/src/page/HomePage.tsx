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
  ];
  return (
    // <div className="homepage-wrapper">
    //   {error && <div className="error-message">{error}</div>}
    //   {nasabah && (
    //     <div className="user-info">
    //       <img src={nasabah.profileImage || "default-profile.png"} alt="Profile" className="profile-image" />
    //       <h3>{nasabah.nama}</h3>
    //       <p>No Rekening: {nasabah.noRekening}</p>
    //       <p>Saldo: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(nasabah.saldo)}</p>
    //     </div>
    //   )}
      <div className="homepage-container">
        <h2 className="homepage-title">Welcome to BCA Mobile</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <Link to={feature.path} key={index} className="feature-link">
              <div className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-label">{feature.name}</div>
              </div>
            </Link>
          ))}

        <div className="feature-link" onClick={handleLogout}>
          <div className="feature-card">
            <div className="feature-icon">🚪</div>
            <div className="feature-label">Logout</div>
          </div>
        </div>

        {/* Floating Action Button untuk Report */}
        <button className="fab" onClick={() => setShowReportForm(true)}>
          📝
        </button>

        {/* Report Form Modal */}
        {showReportForm && (
          <ReportForm onClose={() => setShowReportForm(false)} />
        )}
      </div>

      <button className="fab" onClick={() => setShowReportForm(true)}>
        📝
      </button>

      {showReportForm && (
        <ReportForm onClose={() => setShowReportForm(false)} />
      )}
    </div>
  );
};

export default HomePage;
