import { Link, useNavigate } from "react-router-dom";
import "../../style/MPayment.css";


export const MPayment = () => {

  const navigate = useNavigate();

  const paymentOptions = [
    {
      title: "Tagihan Air",
      icon: "💧",
      path: `/user/mpayment/air`,
      description: "Bayar tagihan air PDAM",
      type: "air",
    },
    {
      title: "Tagihan Listrik",
      icon: "⚡",
      path: `/user/mpayment/listrik`,
      description: "Bayar tagihan listrik PLN",
      type: "listrik",
    },
  ];

  return (
    <div className="mpayment-container">
      <button
        className="mpayment-back-button"
        onClick={() => navigate('/user')}
        style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        Kembali
      </button>

      <h2 className="mpayment-title">M-Payment</h2>
      <div className="payment-options">
        {paymentOptions.map((option, index) => (
          <Link to={option.path} key={index} className="payment-option-link">
            <div className={`payment-option-card ${option.type}`}>
              <div className="payment-option-icon">{option.icon}</div>
              <div className="payment-option-content">
                <h3>{option.title}</h3>
                <p>{option.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
