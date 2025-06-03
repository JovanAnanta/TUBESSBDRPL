import React from 'react';
import { useNavigate } from 'react-router-dom';
import { navigateWithPinVerification, PinVerificationScenarios } from '../../utils/pinUtils';
import '../../style/MTransfer.css';

export const Mtransfer = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (featureName: string, targetPath: string) => {
    // Bypass PIN for Transfer and Top Up
    if (featureName === 'Transfer' || featureName === 'Top Up') {
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
  };  const features = [
    { 
      name: "Transfer", 
      icon: "💸", 
      path: "/user/mtransfer/transfer",
      description: "Transfer uang antar rekening"
    },
    { 
      name: "Top Up", 
      icon: "💳", 
      path: "/user/mtransfer/top-up",
      description: "Isi ulang saldo rekening"
    },
  ];

  return (
    <div className="mtransfer-container">
      <div className="mtransfer-wrapper">
        {/* Header Section */}
        <div className="mtransfer-header">
          <div className="mtransfer-icon">💸</div>
          <h1 className="mtransfer-title">M-Transfer</h1>
          <p className="mtransfer-subtitle">Transfer & Top Up Saldo</p>
        </div>

        {/* Features Card */}
        <div className="mtransfer-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">💰</span>
              Layanan Transfer
            </h2>
            <p className="card-subtitle">Kirim uang dan isi ulang saldo dengan mudah</p>
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

export default Mtransfer;