import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CS.css';
import '../style/CSActivity.css';
import axios from 'axios';

// Define types for our data
interface Transaction {
  transaksi_id: string;
  tanggal: string;
  waktu?: string;
  tipe: string;
  jumlah: number;
  keterangan: string;
  status?: string;
}

interface LoginActivity {
  login_id: string;
  waktu_login: string;
  location: string;
  device_info: string;
  status: string;
}

type TabType = 'transactions' | 'login' | 'alerts';

const CSCustomerActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [filterType, setFilterType] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: '',
    endDate: ''
  });
  
  // For direct keterangan filtering
  const [searchTerm, setSearchTerm] = useState('');

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
        setTransactions(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Gagal memuat data transaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactionsByDateRange = async (nasabahId: string, startDate: string, endDate: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('cs_token');
      
      console.log('Sending date range request:', { startDate, endDate });
      
      const response = await axios.post(
        `http://localhost:3000/api/cs/activity/${nasabahId}/transactions/dateRange`,
        { 
          startDate: startDate, 
          endDate: endDate 
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.data) {
        console.log('Received transactions:', response.data.data.length);
        setTransactions(response.data.data);
      } else {
        console.log('No transactions found or invalid response format');
        setTransactions([]);
      }
    } catch (err: any) {
      console.error("Error fetching transactions by date range:", err);
      setError(`Gagal memuat data transaksi berdasarkan rentang tanggal: ${err.response?.data?.message || err.message}`);
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
        setLoginActivities(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching login activities:", err);
      setError("Gagal memuat data aktivitas login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateRangeFilter = () => {
    if (customerData && dateRangeFilter.startDate && dateRangeFilter.endDate) {
      fetchTransactionsByDateRange(
        customerData.nasabah_id,
        dateRangeFilter.startDate,
        dateRangeFilter.endDate
      );
    }
  };

  const resetDateFilter = () => {
    setDateRangeFilter({
      startDate: '',
      endDate: ''
    });
    
    if (customerData) {
      fetchTransactions(customerData.nasabah_id);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    let match = true;
    
    // Filter by transaction type (MASUK/KELUAR)
    if (filterType && transaction.tipe !== filterType) {
      match = false;
    }
    
    // Filter by search term in keterangan
    if (searchTerm && !transaction.keterangan.toLowerCase().includes(searchTerm.toLowerCase())) {
      match = false;
    }
    
    return match;
  });

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="cs-container">
      <div className="cs-header">
        <div>
          <h1 className="cs-title">Aktivitas Nasabah</h1>
          <p style={{ color: 'white', opacity: 0.9, marginTop: '0.5rem' }}>
            Customer Service Dashboard
          </p>
        </div>
        <button className="cs-logout" onClick={() => navigate('/cs/dashboard')}>
          Kembali
        </button>
      </div>

      {customerData && (
        <div className="customer-profile">
          <div className="customer-avatar">
            👤
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
                <span className="detail-value">{formatCurrency(customerData.saldo || 0)}</span>
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
          💰 Transaksi
        </button>
        <button 
          className={`tab-button ${activeTab === 'login' ? 'active' : ''}`}
          onClick={() => setActiveTab('login')}
        >
          🔐 Aktivitas Login
        </button>
        <button 
          className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 Notifikasi Penting
        </button>
      </div>

      {isLoading && (
        <div className="loading-indicator">
          <div>⏳</div>
          <p>Memuat data...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <div>⚠️</div>
          <p>{error}</p>
        </div>
      )}

      {activeTab === 'transactions' && !isLoading && (
        <div className="activity-content">
          {/* Date Range Filter */}
          <div className="date-range-filter">
            <h3>Filter Rentang Tanggal</h3>
            <div className="date-range-inputs">
              <div className="date-input-group">
                <label htmlFor="start-date">Dari Tanggal:</label>
                <input
                  type="date"
                  id="start-date"
                  value={dateRangeFilter.startDate}
                  onChange={(e) => setDateRangeFilter({...dateRangeFilter, startDate: e.target.value})}
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="end-date">Sampai Tanggal:</label>
                <input
                  type="date"
                  id="end-date"
                  value={dateRangeFilter.endDate}
                  onChange={(e) => setDateRangeFilter({...dateRangeFilter, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="date-range-actions">
              <button 
                className="filter-action-btn apply"
                disabled={!dateRangeFilter.startDate || !dateRangeFilter.endDate}
                onClick={handleDateRangeFilter}
              >
                Terapkan Filter
              </button>
              <button 
                className="filter-action-btn reset"
                onClick={resetDateFilter}
              >
                Reset
              </button>
            </div>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="type-filter">Jenis Transaksi:</label>
              <select
                id="type-filter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="">Semua</option>
                <option value="MASUK">Masuk</option>
                <option value="KELUAR">Keluar</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="search-filter">Cari:</label>
              <input
                type="text"
                id="search-filter"
                placeholder="Cari keterangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button 
              className="filter-reset"
              onClick={() => {
                setFilterType('');
                setSearchTerm('');
              }}
            >
              Reset Filter
            </button>
          </div>

          <div className="transaction-list">
            <div className="transaction-header">
              <div className="th-date">Tanggal</div>
              <div className="th-type">Tipe</div>
              <div className="th-amount">Jumlah</div>
              <div className="th-desc">Keterangan</div>
            </div>
            
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map(transaction => (
                <div key={transaction.transaksi_id} className="transaction-item">
                  <div className="ti-date">
                    <div className="date">{formatDate(transaction.tanggal)}</div>
                    {transaction.waktu && (
                      <div className="time">{transaction.waktu}</div>
                    )}
                  </div>
                  <div className={`ti-type ${transaction.tipe.toLowerCase()}`}>
                    {transaction.tipe === 'MASUK' ? '⬇️' : '⬆️'} {transaction.tipe}
                  </div>
                  <div className={`ti-amount ${transaction.tipe === 'MASUK' ? 'credit' : 'debit'}`}>
                    {transaction.tipe === 'MASUK' ? '+ ' : '- '}
                    {formatCurrency(transaction.jumlah)}
                  </div>
                  <div className="ti-desc">{transaction.keterangan}</div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <div>🔍</div>
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
              loginActivities.map(activity => {
                const loginDate = new Date(activity.waktu_login);
                const formattedDate = loginDate.toISOString().split('T')[0];
                const formattedTime = loginDate.toTimeString().split(' ')[0];
                
                return (
                  <div key={activity.login_id} className="login-activity-item">
                    <div className="li-date">
                      <div className="date">{formatDate(formattedDate)}</div>
                      <div className="time">{formattedTime}</div>
                    </div>
                    <div className="li-device">{activity.device_info || "Unknown"}</div>
                    <div className="li-location">{activity.location || "Unknown"}</div>
                    <div className={`li-status ${activity.status.toLowerCase()}`}>
                      {activity.status === 'SUCCESS' ? '✅' : '❌'} {activity.status}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-data">
                <div>🔍</div>
                <p>Tidak ada data aktivitas login</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="activity-content alerts-content">
          <div className="no-alerts">
            <div>🔕</div>
            <h3>Tidak Ada Notifikasi Penting</h3>
            <p>Tidak ada notifikasi penting atau peringatan keamanan untuk nasabah ini.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CSCustomerActivityPage;