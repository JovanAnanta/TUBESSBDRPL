import React from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithPinVerification, PinVerificationScenarios } from '../../utils/pinUtils';
import '../../style/MInfo.css';

export const MInfo = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (featureName: string, targetPath: string) => {
    // Jika fitur Mutasi Rekening, langsung navigasi tanpa PIN
    if (featureName === 'Mutasi Rekening') {
      navigate(targetPath);
      return;
    }
    // Navigate with PIN verification
    navigateWithPinVerification(navigate, {
      redirectTo: targetPath,
      message: featureName === 'Info Saldo' 
        ? PinVerificationScenarios.BALANCE_CHECK.message
        : PinVerificationScenarios.TRANSACTION_HISTORY.message
    });
  };
  const features = [
    { 
      name: "Info Saldo", 
      icon: "💰", 
      path: "/user/minfo/saldo",
      description: "Lihat saldo dan informasi rekening"
    },
    { 
      name: "Mutasi Rekening", 
      icon: "📊", 
      path: "/user/minfo/mutasi",
      description: "Riwayat transaksi dan mutasi"
    },
  ];
  return (
    <div className="minfo-container">
      <div className="minfo-wrapper">
        {/* Header Section */}
        <div className="minfo-header">
          <div className="minfo-icon">📱</div>
          <h1 className="minfo-title">M-Info</h1>
          <p className="minfo-subtitle">Informasi Rekening & Transaksi Anda</p>
        </div>

        {/* Features Card */}
        <div className="minfo-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">🔍</span>
              Pilihan Layanan
            </h2>
            <p className="card-subtitle">Akses informasi rekening dan riwayat transaksi</p>
          </div>
          
          <div className="features-grid">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="feature-link"
                onClick={() => handleFeatureClick(feature.name, feature.path)}
              >
                <div className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-content">
                    <div className="feature-label">{feature.name}</div>
                    <div className="feature-description">{feature.description}</div>
                  </div>
                  <div className="feature-arrow">→</div>
                </div>
              </div>
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

export default MInfo;