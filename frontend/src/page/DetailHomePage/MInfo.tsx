import React from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithPinVerification, PinVerificationScenarios } from '../../utils/pinUtils';
import '../../style/MInfo.css';

export const MInfo = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (featureName: string, targetPath: string) => {
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
      <h2 className="minfo-title">M-Info</h2>
      <p className="minfo-subtitle">Informasi Rekening & Transaksi</p>
      
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
            </div>
          </div>
        ))}
      </div>

      {/* Back Button */}
      <div className="back-button-container">
        <button className="back-button" onClick={() => navigate('/user')}>
          ← Kembali ke Beranda
        </button>
      </div>
    </div>
  );
};

export default MInfo;