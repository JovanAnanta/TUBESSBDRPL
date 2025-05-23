import { Link } from 'react-router-dom';
import { TagihanType } from '../../../../backend/models/Tagihan';
import '../../style/MPayment.css';

export const MPayment = () => {
  const paymentOptions = [
    {
      title: 'Tagihan Air',
      icon: '💧',
      path: `/user/mpayment/${TagihanType.AIR.toLowerCase()}`,
      description: 'Bayar tagihan air PDAM',
      type: TagihanType.AIR
    },
    {
      title: 'Tagihan Listrik',
      icon: '⚡',
      path: `/user/mpayment/${TagihanType.LISTRIK.toLowerCase()}`,
      description: 'Bayar tagihan listrik PLN',
      type: TagihanType.LISTRIK
    }
  ];

  return (
    <div className="mpayment-container">
      <h2 className="mpayment-title">M-Payment</h2>
      <div className="payment-options">
        {paymentOptions.map((option, index) => (
          <Link to={option.path} key={index} className="payment-option-link">
            <div className={`payment-option-card ${option.type.toLowerCase()}`}>
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