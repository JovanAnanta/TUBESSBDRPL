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
  const [showReportForm, setShowReportForm] = useState(false);
  const [nasabah, setNasabah] = useState<Nasabah | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const nasabahId = localStorage.getItem("nasabahId");

    if (token && nasabahId) {
      fetchNasabahData(token);
    } else {
      navigate('/auth/login'); // jika tidak ada token, redirect
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nasabahId");
    setNasabah(null);
    navigate("/auth/login");
  };

  const fetchNasabahData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/user/getDataNasabah', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data nasabah');
      }

      const data = await response.json();
      setNasabah(data.data);
    } catch (error) {
      setError('Terjadi kesalahan saat mengambil data nasabah');
      console.error('Error:', error);
    }
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

          {/* Tombol Logout */}
          <div className="feature-link" onClick={handleLogout}>
            <div className="feature-card">
              <div className="feature-icon">🚪</div>
              <div className="feature-label">Logout</div>
            </div>
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
    // </div>
  );
};

export default HomePage;
