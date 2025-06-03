import { Link, useNavigate } from "react-router-dom";
import "../../style/Settings.css";

export const Setting = () => {
  const navigate = useNavigate();
  
  const settingOptions = [
    {
      title: "Ganti PIN",
      icon: "🔒",
      path: "/user/nasabah/ganti-pin",
      description: "Ubah PIN untuk keamanan transaksi"
    },
    {
      title: "Ganti Password",
      icon: "🔑",
      path: "/user/nasabah/ganti-password",
      description: "Ubah password login akun Anda"
    }
  ];

  return (
    <div className="setting-container">
      <div className="setting-wrapper">
        {/* Header Section */}
        <div className="setting-header">
          <div className="setting-icon">⚙️</div>
          <h1 className="setting-title">Pengaturan Akun</h1>
          <p className="setting-subtitle">Kelola keamanan dan preferensi akun</p>
        </div>

        {/* Settings Card */}
        <div className="setting-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">🛡️</span>
              Keamanan Akun
            </h2>
            <p className="card-subtitle">Atur PIN dan password untuk melindungi akun Anda</p>
          </div>
          
          <div className="setting-options">
            {settingOptions.map((option, index) => (
              <Link key={index} to={option.path} className="setting-option-link">
                <div className="setting-option">
                  <div className="setting-option-icon">{option.icon}</div>
                  <div className="setting-option-content">
                    <h3 className="setting-option-title">{option.title}</h3>
                    <p className="setting-option-description">{option.description}</p>
                  </div>
                  <div className="setting-arrow">→</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate('/user')}>
            <span className="back-icon">←</span>
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
