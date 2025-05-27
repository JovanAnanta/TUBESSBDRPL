import React from 'react';
import { Link } from 'react-router-dom';
import '../style/InformationBanking.css'; // Buat file CSS baru untuk halaman ini

const InformationBanking = () => {
  const customerServiceNumber = "1500-888"; // Ganti dengan nomor CS Anda
  const whatsappNumber = "0811-1234-5678"; // Ganti dengan nomor WhatsApp CS Anda (opsional)

  return (
    <div className="info-banking-container">
      <div className="info-banking-card">
        <h1 className="info-banking-title">Informasi Layanan Bank</h1>
        
        <div className="info-section">
          <h2>Butuh Bantuan?</h2>
          <p>Hubungi Customer Service kami jika Anda memerlukan bantuan atau informasi lebih lanjut.</p>
          <p className="contact-detail">
            <strong>Telepon:</strong> <a href={`tel:${customerServiceNumber}`}>{customerServiceNumber}</a>
          </p>
          <p className="contact-detail">
            <strong>WhatsApp:</strong> <a href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">{whatsappNumber}</a>
          </p>
          <p className="important-note">
            <strong>Penting:</strong> Jaga kerahasiaan data pribadi Anda. Bank tidak pernah meminta PIN, OTP, atau password melalui telepon atau media lainnya.
          </p>
        </div>

        <div className="info-section">
          <h2>Tips Keamanan</h2>
          <ul>
            <li>Gunakan password yang kuat dan unik.</li>
            <li>Jangan bagikan kode akses atau password Anda kepada siapapun.</li>
            <li>Waspada terhadap upaya phising atau penipuan.</li>
            <li>Pastikan Anda mengakses website atau aplikasi resmi bank.</li>
            <li>Segera hubungi kami jika menemukan aktivitas mencurigakan pada akun Anda.</li>
          </ul>
        </div>
        
        <Link to="/auth/login" className="btn btn-back">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
};

export default InformationBanking;