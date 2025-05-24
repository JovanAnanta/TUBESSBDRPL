import React from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithPinVerification, PinVerificationScenarios } from '../../utils/pinUtils';
import '../../style/MInfo.css';

export const Mtransfer = () => {
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
      name: "m-transfer", 
      icon: "💰", 
      path: "/user/mtransfer/transfer",
      description: "Transfer antar rekening dan cek saldo"
    },
    { 
      name: "top-up", 
      icon: "📊", 
      path: "/user/mtransfer/top-up",
      description: "top-up saldo dan riwayat transaksi"
    },
  ];

  return (
    <div className="mtransfer-container">
      <h2 className="Mtransfer-title">M-Info</h2>
      <p className="Mtransfer-subtitle">Informasi Rekening & Transaksi</p>
      
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

export default Mtransfer;