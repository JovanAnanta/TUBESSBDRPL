import { Link, useNavigate } from "react-router-dom";
import "../../style/Settings.css";

export const Setting = () => {
  const navigate = useNavigate();
  return (
    <div className="setting-container">
      <button
        className="mpayment-back-button"
        onClick={() => navigate('/user')}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        Kembali
      </button>
      <h2 className="setting-title">Pengaturan Akun</h2>
      <div className="setting-options">
        <Link to="/user/nasabah/ganti-pin" className="setting-option">
          🔒 Ganti PIN
        </Link>
        <Link to="/user/nasabah/ganti-password" className="setting-option">
          🔑 Ganti Password
        </Link>
      </div>

    </div>
  );
};
