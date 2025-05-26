import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CS.css';
import '../style/Admin.css';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');
  const [stats, setStats] = useState({
    pendingLoans: 0,
    approvedLoans: 0,
    totalUsers: 0,
    blockedUsers: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const name = localStorage.getItem('admin_name');
    setAdminName(name || 'Administrator');

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const pendingResponse = await fetch('http://localhost:3000/api/admin/pinjaman/daftar', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const usersResponse = await fetch('http://localhost:3000/api/admin/nasabah', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (pendingResponse.ok && usersResponse.ok) {
          const pendingData = await pendingResponse.json();
          const userData = await usersResponse.json();
          
          setStats({
            pendingLoans: pendingData.data.filter((loan: any) => loan.statusPinjaman === 'PENDING').length,
            approvedLoans: pendingData.data.filter((loan: any) => loan.statusPinjaman === 'ACCEPTED').length,
            totalUsers: userData.data.length,
            blockedUsers: userData.data.filter((user: any) => user.status === 'TIDAK AKTIF').length
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      }
    };

    fetchStats();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    navigate('/admin/login');
  };

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <div className="admin-logo">
          <span className="bank-icon">🏦</span>
          <h3>Bank System</h3>
        </div>
        <div className="admin-menu">
          <div 
            className="menu-item active"
            onClick={() => navigate('/admin/dashboard')}
          >
            <span className="menu-icon">📊</span>
            <span>Dashboard</span>
          </div>
          <div 
            className="menu-item"
            onClick={() => navigate('/admin/loan-management')}
          >
            <span className="menu-icon">💰</span>
            <span>Loan Management</span>
          </div>
          <div 
            className="menu-item"
            onClick={() => navigate('/admin/user-management')}
          >
            <span className="menu-icon">👥</span>
            <span>User Management</span>
          </div>
          <div className="menu-item" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <h1>Welcome, {adminName}</h1>
          <div className="admin-profile">
            <span className="admin-avatar">👨‍💼</span>
            <span>Administrator</span>
          </div>
        </div>

        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <div className="stat-icon pending">🕒</div>
            <div className="stat-content">
              <h3>{stats.pendingLoans}</h3>
              <p>Pending Loans</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon approved">✅</div>
            <div className="stat-content">
              <h3>{stats.approvedLoans}</h3>
              <p>Approved Loans</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon users">👥</div>
            <div className="stat-content">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon blocked">🔒</div>
            <div className="stat-content">
              <h3>{stats.blockedUsers}</h3>
              <p>Blocked Users</p>
            </div>
          </div>
        </div>

        <div className="admin-quick-actions">
          <h2>Quick Actions</h2>
          <div className="action-cards">
            <div className="action-card" onClick={() => navigate('/admin/loan-management')}>
              <div className="action-icon">📝</div>
              <h3>Review Loan Applications</h3>
              <p>Manage and process pending loan requests</p>
              <button className="action-button">Go to Loans</button>
            </div>
            <div className="action-card" onClick={() => navigate('/admin/user-management')}>
              <div className="action-icon">🔐</div>
              <h3>Manage User Accounts</h3>
              <p>Block/unblock users and manage account access</p>
              <button className="action-button">Go to Users</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;