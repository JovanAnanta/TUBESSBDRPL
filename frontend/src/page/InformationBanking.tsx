import React from 'react';
import { Link } from 'react-router-dom';
import '../style/InformationBanking.css'; // Buat file CSS baru untuk halaman ini

const InformationBanking = () => {
  const customerServiceNumber = "1500-888"; // Ganti dengan nomor CS Anda
  const whatsappNumber = "0811-1234-5678"; // Ganti dengan nomor WhatsApp CS Anda (opsional)
  return (
    <div className="info-banking-container">
      <div className="info-banking-wrapper">
        <div className="info-banking-card">
          <div className="info-banking-header">
            <div className="info-banking-icon">📞</div>
            <h1 className="info-banking-title">Informasi Layanan Bank</h1>
            <p className="info-banking-subtitle">Customer Service & Bantuan</p>
          </div>
          
          <div className="info-banking-content">
            <div className="info-section help-section">
              <h2 className="section-title">
                <span className="section-icon">🆘</span>
                Butuh Bantuan?
              </h2>
              <p className="section-description">
                Hubungi Customer Service kami jika Anda memerlukan bantuan atau informasi lebih lanjut.
              </p>
              
              <div className="contact-grid">
                <div className="contact-item">
                  <div className="contact-icon">📱</div>
                  <div className="contact-details">
                    <div className="contact-label">Telepon</div>
                    <a href={`tel:${customerServiceNumber}`} className="contact-value">
                      {customerServiceNumber}
                    </a>
                  </div>
                </div>
                
                <div className="contact-item">
                  <div className="contact-icon">💬</div>
                  <div className="contact-details">
                    <div className="contact-label">WhatsApp</div>
                    <a 
                      href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="contact-value"
                    >
                      {whatsappNumber}
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="important-notice">
                <div className="notice-icon">⚠️</div>
                <div className="notice-content">
                  <strong>Penting:</strong> Jaga kerahasiaan data pribadi Anda. Bank tidak pernah meminta PIN, OTP, atau password melalui telepon atau media lainnya.
                </div>
              </div>
            </div>

            <div className="info-section security-section">
              <h2 className="section-title">
                <span className="section-icon">🔒</span>
                Tips Keamanan
              </h2>
              <ul className="security-list">
                <li className="security-item">
                  <span className="security-bullet">✓</span>
                  Gunakan password yang kuat dan unik.
                </li>
                <li className="security-item">
                  <span className="security-bullet">✓</span>
                  Jangan bagikan kode akses atau password Anda kepada siapapun.
                </li>
                <li className="security-item">
                  <span className="security-bullet">✓</span>
                  Waspada terhadap upaya phising atau penipuan.
                </li>
                <li className="security-item">
                  <span className="security-bullet">✓</span>
                  Pastikan Anda mengakses website atau aplikasi resmi bank.
                </li>
                <li className="security-item">
                  <span className="security-bullet">✓</span>
                  Segera hubungi kami jika menemukan aktivitas mencurigakan pada akun Anda.
                </li>
              </ul>
            </div>
          </div>
          
          <div className="info-banking-footer">
            <Link to="/auth/login" className="back-button">
              <span className="back-icon">←</span>
              <span>Kembali ke Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationBanking;