import { Link, useNavigate } from "react-router-dom";
import "../../style/MPayment.css";

export const MPayment = () => {
  const navigate = useNavigate();
  
  const paymentOptions = [
    {
      title: "Tagihan Air",
      icon: "💧",
      path: `/user/tagihan/air`,
      description: "Bayar tagihan air PDAM",
      type: "air",
    },
    {
      title: "Tagihan Listrik",
      icon: "⚡",
      path: `/user/tagihan/listrik`,
      description: "Bayar tagihan listrik PLN",
      type: "listrik",
    },
    {
      title: "Pinjaman",
      icon: "💰",
      path: `/user/mpayment/pinjaman`,
      description: "Lihat dan bayar pinjaman",
      type: "pinjaman",
    },
  ];

  return (
    <div className="mpayment-container">
      <div className="mpayment-wrapper">
        {/* Header Section */}
        <div className="mpayment-header">
          <div className="mpayment-icon">💳</div>
          <h1 className="mpayment-title">M-Payment</h1>
          <p className="mpayment-subtitle">Pembayaran Tagihan & Layanan</p>
        </div>

        {/* Payment Options Card */}
        <div className="mpayment-card">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">🧾</span>
              Pilihan Pembayaran
            </h2>
            <p className="card-subtitle">Bayar berbagai tagihan dengan mudah dan aman</p>
          </div>
          
          <div className="payment-options">
            {paymentOptions.map((option, index) => (
              <Link to={option.path} key={index} className="payment-option-link">
                <div className={`payment-option-card ${option.type}`}>
                  <div className="payment-option-icon">{option.icon}</div>
                  <div className="payment-option-content">
                    <h3 className="payment-option-title">{option.title}</h3>
                    <p className="payment-option-description">{option.description}</p>
                  </div>
                  <div className="payment-arrow">→</div>
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
