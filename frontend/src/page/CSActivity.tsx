import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CS.css';
import '../style/CSActivity.css';
import axios from 'axios';

// Define types for our data
interface Transaction {
  id?: number;
  date: string;
  time?: string;
  tanggal?: string;
  tipe: string;
  type?: string;
  jumlah: number;
  amount?: number;
  keterangan: string;
  description?: string;
  balance?: number;
}

interface LoginActivity {
  login_id: string;
  waktu_login: string;
  location: string;
  device_info: string;
  status: string;
  id?: number;
  date?: string;
  time?: string;
  device?: string;
}

type TabType = 'transactions' | 'login' | 'alerts';

const CSCustomerActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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
      const customerInfo = JSON.parse(verifiedCustomer);
      setCustomerData(customerInfo);
      
      // Fetch data when customer is loaded
      fetchTransactions(customerInfo.nasabah_id);
      fetchLoginActivities(customerInfo.nasabah_id);
    } catch (error) {
      console.error("Error parsing customer data:", error);
      navigate('/cs/validation');
    }
  }, [navigate]);

  const fetchTransactions = async (nasabahId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cs_token');
      const response = await axios.get(
        `http://localhost:3000/api/cs/activity/${nasabahId}/transactions`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.data) {
        // Transform API data to match our component's format
        const formattedTransactions = response.data.data.map((item: any, index: number) => {
          const date = item.tanggal.split('T')[0];
          return {
            id: index + 1,
            date: date,
            time: new Date().toTimeString().split(' ')[0], // Using current time as API doesn't provide time
            type: item.tipe === 'TRANSFER' || item.tipe === 'DEBIT' || item.tipe === 'TAGIHAN' ? 'DEBIT' : 'CREDIT',
            amount: item.jumlah,
            description: item.keterangan,
            balance: 0, // Balance data not provided from API
            // Keep original API fields also to ensure we don't lose data
            tanggal: item.tanggal,
            tipe: item.tipe,
            jumlah: item.jumlah,
            keterangan: item.keterangan
          };
        });
        setTransactions(formattedTransactions);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Gagal memuat data transaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLoginActivities = async (nasabahId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('cs_token');
      const response = await axios.get(
        `http://localhost:3000/api/cs/activity/${nasabahId}/logins`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.data) {
        // Transform API data to match our component's format
        const formattedLoginActivities = response.data.data.map((item: any, index: number) => {
          const loginDate = new Date(item.waktu_login);
          return {
            login_id: item.login_id,
            id: index + 1,
            date: loginDate.toISOString().split('T')[0],
            time: loginDate.toTimeString().split(' ')[0],
            device: item.device_info || 'Unknown Device',
            location: item.location || 'Unknown Location',
            status: item.status,
            waktu_login: item.waktu_login,
            device_info: item.device_info
          };
        });
        setLoginActivities(formattedLoginActivities);
      }
    } catch (err) {
      console.error("Error fetching login activities:", err);
      setError("Gagal memuat data aktivitas login.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
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
    <div className="cs-container">
      <div className="cs-header">
        <div>
          <h1 className="cs-title">Aktivitas Nasabah</h1>
          <p style={{ color: 'white', opacity: 0.9, marginTop: '0.5rem' }}>
            Customer Service Dashboard
          </p>
        </div>
        <button className="cs-logout" onClick={() => navigate('/cs/validation')}>
          Kembali
        </button>
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

      {isLoading && (
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Memuat data...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
        </div>
      )}

      {activeTab === 'transactions' && !isLoading && (
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
            </div>
            
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <div key={transaction.id} className="transaction-item">
                  <div className="ti-date">
                    <div className="date">{transaction.date}</div>
                    <div className="time">{transaction.time || '00:00:00'}</div>
                  </div>
                  <div className={`ti-type ${transaction.type?.toLowerCase()}`}>
                    {transaction.type === 'CREDIT' ? (
                      <i className="fas fa-arrow-down"></i>
                    ) : (
                      <i className="fas fa-arrow-up"></i>
                    )}
                    {transaction.type}
                  </div>
                  <div className={`ti-amount ${transaction.type?.toLowerCase()}`}>
                    {transaction.type === 'CREDIT' ? '+ ' : '- '}
                    Rp {transaction.amount?.toLocaleString('id-ID')}
                  </div>
                  <div className="ti-desc">{transaction.description}</div>
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

      {activeTab === 'login' && !isLoading && (
        <div className="activity-content">
          <div className="login-activity-list">
            <div className="login-activity-header">
              <div className="lh-date">Tanggal & Waktu</div>
              <div className="lh-device">Device</div>
              <div className="lh-location">Lokasi</div>
              <div className="lh-status">Status</div>
            </div>
            
            {loginActivities.length > 0 ? (
              loginActivities.map(activity => (
                <div key={activity.login_id} className="login-activity-item">
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
              ))
            ) : (
              <div className="no-data">
                <i className="fas fa-search"></i>
                <p>Tidak ada data aktivitas login</p>
              </div>
            )}
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