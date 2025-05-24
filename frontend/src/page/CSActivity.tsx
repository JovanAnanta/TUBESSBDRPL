import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CS.css';
import '../style/CSActivity.css';

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: 1,
    date: '2024-05-22',
    time: '09:45:23',
    type: 'DEBIT',
    amount: 750000,
    description: 'Transfer ke Ahmad Yusuf',
    balance: 4250000
  },
  {
    id: 2,
    date: '2024-05-20',
    time: '14:30:11',
    type: 'CREDIT',
    amount: 2000000,
    description: 'Penerimaan dari PT Maju Bersama',
    balance: 5000000
  },
  {
    id: 3,
    date: '2024-05-18',
    time: '11:15:47',
    type: 'DEBIT',
    amount: 500000,
    description: 'Pembayaran Tagihan Listrik',
    balance: 3000000
  },
  {
    id: 4,
    date: '2024-05-15',
    time: '16:22:30',
    type: 'DEBIT',
    amount: 1200000,
    description: 'Penarikan ATM',
    balance: 3500000
  },
  {
    id: 5,
    date: '2024-05-10',
    time: '10:05:12',
    type: 'CREDIT',
    amount: 4700000,
    description: 'Penerimaan Gaji',
    balance: 4700000
  }
];

// Mock login activity data
const MOCK_LOGIN_ACTIVITIES = [
  {
    id: 1,
    date: '2024-05-23',
    time: '08:15:45',
    device: 'Mobile App - Android',
    location: 'Bandung, Indonesia',
    status: 'SUCCESS'
  },
  {
    id: 2,
    date: '2024-05-21',
    time: '19:30:22',
    device: 'Web Browser - Chrome',
    location: 'Jakarta, Indonesia',
    status: 'SUCCESS'
  },
  {
    id: 3,
    date: '2024-05-20',
    time: '07:45:10',
    device: 'Mobile App - iOS',
    location: 'Bandung, Indonesia',
    status: 'SUCCESS'
  },
  {
    id: 4,
    date: '2024-05-18',
    time: '22:10:35',
    device: 'Web Browser - Safari',
    location: 'Surabaya, Indonesia',
    status: 'FAILED'
  },
];

type TabType = 'transactions' | 'login' | 'alerts';

const CSCustomerActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      navigate('/cs/login');
      return;
    }

    const verifiedCustomer = localStorage.getItem('verified_customer');
    if (!verifiedCustomer) {
      navigate('/cs/validation');
      return;
    }

    try {
      setCustomerData(JSON.parse(verifiedCustomer));
    } catch (error) {
      console.error("Error parsing customer data:", error);
      navigate('/cs/validation');
    }
  }, [navigate]);

  const handleBack = () => {
    navigate('/cs/validation');
  };

  const filteredTransactions = MOCK_TRANSACTIONS.filter(transaction => {
    let match = true;
    
    if (filterDate && !transaction.date.includes(filterDate)) {
      match = false;
    }
    
    if (filterType && transaction.type !== filterType) {
      match = false;
    }
    
    return match;
  });

  return (
    <div className="cs-container activity-container">
      <div className="cs-header activity-header">
        <button className="back-button" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i> Kembali
        </button>
        <h1>Aktivitas Nasabah</h1>
      </div>

      {customerData && (
        <div className="customer-profile">
          <div className="customer-avatar">
            <i className="fas fa-user-circle"></i>
          </div>
          <div className="customer-info">
            <h2>{customerData.nama}</h2>
            <div className="customer-details-row">
              <div className="detail">
                <span className="detail-label">No. Rekening</span>
                <span className="detail-value">{customerData.noRekening}</span>
              </div>
              <div className="detail">
                <span className="detail-label">Saldo</span>
                <span className="detail-value">Rp {customerData.saldo?.toLocaleString('id-ID') || 0}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="activity-tabs">
        <button 
          className={`tab-button ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <i className="fas fa-exchange-alt"></i> Transaksi
        </button>
        <button 
          className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          <i className="fas fa-sign-in-alt"></i> Aktivitas Login
        </button>
        <button 
          className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          <i className="fas fa-exclamation-triangle"></i> Notifikasi Penting
        </button>
      </div>

      {activeTab === 'transactions' && (
        <div className="activity-content">
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="date-filter">Filter Tanggal:</label>
              <input
                type="date"
                id="date-filter"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label htmlFor="type-filter">Jenis Transaksi:</label>
              <select
                id="type-filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Semua</option>
                <option value="DEBIT">Debit</option>
                <option value="CREDIT">Kredit</option>
              </select>
            </div>
            
            <button 
              className="filter-reset"
              onClick={() => {
                setFilterDate('');
                setFilterType('');
              }}
            >
              Reset Filter
            </button>
          </div>

          <div className="transaction-list">
            <div className="transaction-header">
              <div className="th-date">Tanggal & Waktu</div>
              <div className="th-type">Tipe</div>
              <div className="th-amount">Jumlah</div>
              <div className="th-desc">Deskripsi</div>
              <div className="th-balance">Saldo</div>
            </div>
            
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="ti-date">
                    <div className="date">{transaction.date}</div>
                    <div className="time">{transaction.time}</div>
                  </div>
                  <div className={`ti-type ${transaction.type.toLowerCase()}`}>
                    {transaction.type === 'CREDIT' ? (
                      <i className="fas fa-arrow-down"></i>
                    ) : (
                      <i className="fas fa-arrow-up"></i>
                    )}
                    {transaction.type}
                  </div>
                  <div className={`ti-amount ${transaction.type.toLowerCase()}`}>
                    {transaction.type === 'CREDIT' ? '+ ' : '- '}
                    Rp {transaction.amount.toLocaleString('id-ID')}
                  </div>
                  <div className="ti-desc">{transaction.description}</div>
                  <div className="ti-balance">Rp {transaction.balance.toLocaleString('id-ID')}</div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Tidak ada transaksi yang sesuai dengan filter</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'login' && (
        <div className="activity-content">
          <div className="login-activity-list">
            <div className="login-activity-header">
              <div className="lh-date">Tanggal & Waktu</div>
              <div className="lh-device">Device</div>
              <div className="lh-location">Lokasi</div>
              <div className="lh-status">Status</div>
            </div>
            
            {MOCK_LOGIN_ACTIVITIES.map(activity => (
              <div key={activity.id} className="login-activity-item">
                <div className="li-date">
                  <div className="date">{activity.date}</div>
                  <div className="time">{activity.time}</div>
                </div>
                <div className="li-device">{activity.device}</div>
                <div className="li-location">{activity.location}</div>
                <div className={`li-status ${activity.status.toLowerCase()}`}>
                  {activity.status === 'SUCCESS' ? (
                    <i className="fas fa-check-circle"></i>
                  ) : (
                    <i className="fas fa-times-circle"></i>
                  )}
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="activity-content alerts-content">
          <div className="no-alerts">
            <i className="fas fa-bell-slash"></i>
            <h3>Tidak Ada Notifikasi Penting</h3>
            <p>Tidak ada notifikasi penting atau peringatan keamanan untuk nasabah ini.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSCustomerActivityPage;