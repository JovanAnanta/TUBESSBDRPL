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

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      navigate('/cs/login');
      return;
    }

    const name = localStorage.getItem('cs_name');
    setCsName(name || 'Customer Service');

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
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_name');
    localStorage.removeItem('token');
    navigate('/cs/login');
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
      path: '/cs/reset-password'
    },
    {
      icon: '📊',
      title: 'Aktivitas Nasabah',
      description: 'Pantau dan tinjau riwayat transaksi dan aktivitas nasabah',
      path: '/cs/validation'
    },
    {
      icon: '✅',
      title: 'Validasi Nasabah',
      description: 'Validasi data nasabah untuk keamanan dan keperluan layanan',
      path: '/cs/validation'
    },
    {
      icon: '📝',
      title: 'Kelola Laporan',
      description: 'Tangani dan resolve laporan serta keluhan dari nasabah',
      path: '/cs/reports'
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
            className="cs-card"
            onClick={() => navigate(feature.path)}
          >
            <div className="cs-card-icon">{feature.icon}</div>
            <h3 className="cs-card-title">{feature.title}</h3>
            <p className="cs-card-description">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CSHomePage;
