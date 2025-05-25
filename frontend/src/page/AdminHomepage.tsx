import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CS.css'; // Reusing CS styles for now

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    const name = localStorage.getItem('admin_name');
    setAdminName(name || 'Administrator');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_name');
    navigate('/admin/login');
  };

  return (
    <div className="cs-container">
      <div className="cs-header">
        <div>
          <h1 className="cs-title">Welcome, {adminName}</h1>
          <p style={{ color: 'white', opacity: 0.9, marginTop: '0.5rem' }}>
            Administrator Dashboard
          </p>
        </div>
        <button className="cs-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="cs-grid">
        <div className="cs-card">
          <div className="cs-card-icon">👥</div>
          <h3 className="cs-card-title">User Management</h3>
          <p className="cs-card-description">
            Manage system users including customers and customer service representatives
          </p>
        </div>

        <div className="cs-card">
          <div className="cs-card-icon">📊</div>
          <h3 className="cs-card-title">System Reports</h3>
          <p className="cs-card-description">
            View and generate reports about system usage and activities
          </p>
        </div>

        <div className="cs-card">
          <div className="cs-card-icon">⚙️</div>
          <h3 className="cs-card-title">System Settings</h3>
          <p className="cs-card-description">
            Configure system parameters and preferences
          </p>
        </div>

        <div className="cs-card">
          <div className="cs-card-icon">🛡️</div>
          <h3 className="cs-card-title">Security Settings</h3>
          <p className="cs-card-description">
            Manage system security policies and access controls
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;