import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CS.css';

const CSHomePage: React.FC = () => {
  const navigate = useNavigate();
  const [csName, setCsName] = useState('');
  const [stats, setStats] = useState({
    pendingReports: 0,
    completedReports: 0,
    pendingValidations: 0,
    totalCustomers: 0
  });
  // Track if a customer has been validated
  const [validatedCustomer, setValidatedCustomer] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      navigate('/cs/login');
      return;
    }

    const name = localStorage.getItem('cs_name');
    setCsName(name || 'Customer Service');

    // Check if there's a verified customer
    const checkVerifiedCustomer = () => {
      const verifiedCustomer = localStorage.getItem('verified_customer');
      if (verifiedCustomer) {
        try {
          const customerData = JSON.parse(verifiedCustomer);
          setValidatedCustomer(customerData);
        } catch (error) {
          console.error("Error parsing verified customer data:", error);
          // Clear invalid data
          localStorage.removeItem('verified_customer');
          setValidatedCustomer(null);
        }
      } else {
        setValidatedCustomer(null);
      }
    };

    // Check initially
    checkVerifiedCustomer();

    // Set interval to check periodically
    const intervalId = setInterval(checkVerifiedCustomer, 2000);

    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/cs/stats', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Gagal mengambil statistik');

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetch stats:', error);
      }
    };

    fetchStats();

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_name');
    localStorage.removeItem('verified_customer'); // Also clear any validated customer
    localStorage.removeItem('token');
    navigate('/cs/login');
  };

  // Handle feature card clicks with validation check
  const handleFeatureClick = (path: string, requiresValidation: boolean) => {
    if (requiresValidation && !validatedCustomer) {
      // Show alert and redirect to validation page
      alert('Silakan validasi nasabah terlebih dahulu sebelum mengakses fitur ini.');
      navigate('/cs/validation');
    } else {
      // Normal navigation
      navigate(path);
    }
  };

  const statsDisplay = [
    { number: stats.pendingReports.toString(), label: 'Laporan Pending' },
    { number: stats.completedReports.toString(), label: 'Laporan Selesai' },
    { number: stats.pendingValidations.toString(), label: 'Validasi Menunggu' },
    { number: stats.totalCustomers.toString(), label: 'Total Nasabah' },
  ];

  const features = [
    {
      icon: '🔑',
      title: 'Reset Password',
      description: 'Reset password nasabah yang mengalami kesulitan akses akun',
      path: '/cs/reset-password',
      requiresValidation: false
    },
    {
      icon: '📊',
      title: 'Aktivitas Nasabah',
      description: 'Pantau dan tinjau riwayat transaksi dan aktivitas nasabah',
      path: '/cs/customer-activity',
      requiresValidation: true
    },
    {
      icon: '✅',
      title: 'Validasi Nasabah',
      description: 'Validasi data nasabah untuk keamanan dan keperluan layanan',
      path: '/cs/validation',
      requiresValidation: false
    },
    {
      icon: '📝',
      title: 'Kelola Laporan',
      description: 'Tangani dan resolve laporan serta keluhan dari nasabah',
      path: '/cs/reports',
      requiresValidation: false
    }
  ];

  return (
    <div className="cs-container">
      <div className="cs-header">
        <div>
          <h1 className="cs-title">Selamat Datang, {csName}</h1>
          <p style={{ color: 'white', opacity: 0.9, marginTop: '0.5rem' }}>
            Bank Customer Service Dashboard
          </p>
        </div>
        <button className="cs-logout" onClick={handleLogout}>
          Keluar
        </button>
      </div>

      {validatedCustomer && (
        <div className="cs-validated-customer">
          <div className="validated-customer-info">
            <div className="validated-icon">✅</div>
            <div>
              <h3>Nasabah Tervalidasi</h3>
              <p>
                {validatedCustomer.nama} - {validatedCustomer.noRekening}
              </p>
            </div>
          </div>
          <button 
            className="clear-validation-btn"
            onClick={() => {
              localStorage.removeItem('verified_customer');
              setValidatedCustomer(null);
            }}
          >
            Hapus Validasi
          </button>
        </div>
      )}

      <div className="cs-stats">
        {statsDisplay.map((stat, index) => (
          <div key={index} className="cs-stat-card">
            <div className="cs-stat-number">{stat.number}</div>
            <div className="cs-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="cs-grid">
        {features.map((feature, index) => (
          <div
            key={index}
            className={`cs-card ${feature.requiresValidation && !validatedCustomer ? 'cs-card-disabled' : ''}`}
            onClick={() => handleFeatureClick(feature.path, feature.requiresValidation)}
          >
            <div className="cs-card-icon">{feature.icon}</div>
            <h3 className="cs-card-title">{feature.title}</h3>
            <p className="cs-card-description">{feature.description}</p>
            
            {feature.requiresValidation && (
              <div className={`validation-indicator ${validatedCustomer ? 'available' : 'required'}`}>
                {validatedCustomer ? 'Tersedia' : 'Perlu Validasi Nasabah'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CSHomePage;
