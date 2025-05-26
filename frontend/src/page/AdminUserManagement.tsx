import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Admin.css';

interface User {
  nasabah_id: string;
  nama: string;
  email: string;
  status: 'AKTIF' | 'TIDAK AKTIF';
}

const AdminUserManagement: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newStatus, setNewStatus] = useState<'AKTIF' | 'TIDAK AKTIF' | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    // Apply filter and search
    let result = users;
    
    // Filter by status
    if (filter === 'ACTIVE') {
      result = result.filter(user => user.status === 'AKTIF');
    } else if (filter === 'BLOCKED') {
      result = result.filter(user => user.status === 'TIDAK AKTIF');
    }
    
    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(user => 
        user.nama.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredUsers(result);
  }, [filter, search, users]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/admin/nasabah', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data || []);
      setFilteredUsers(data.data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const openConfirmModal = (user: User, newStatus: 'AKTIF' | 'TIDAK AKTIF') => {
    setSelectedUser(user);
    setNewStatus(newStatus);
    setShowConfirmModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedUser || !newStatus) return;
    
    setProcessingUserId(selectedUser.nasabah_id);
    setShowConfirmModal(false);
    
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3000/api/admin/nasabah/${selectedUser.nasabah_id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update user status');
      }

      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.nasabah_id === selectedUser.nasabah_id ? { ...user, status: newStatus } : user
        )
      );
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating user status');
      console.error('Error updating user status:', err);
    } finally {
      setProcessingUserId(null);
      setSelectedUser(null);
      setNewStatus(null);
    }
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
            className="menu-item"
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
            className="menu-item active"
            onClick={() => navigate('/admin/user-management')}
          >
            <span className="menu-icon">👥</span>
            <span>User Management</span>
          </div>
          <div 
            className="menu-item"
            onClick={() => {
              localStorage.removeItem('admin_token');
              localStorage.removeItem('admin_name');
              navigate('/admin/login');
            }}
          >
            <span className="menu-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-header">
          <h1>User Management</h1>
          <div className="admin-profile">
            <span className="admin-avatar">👨‍💼</span>
            <span>{localStorage.getItem('admin_name') || 'Administrator'}</span>
          </div>
        </div>

        <div className="filter-tabs">
          <div 
            className={`filter-tab ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            All Users
          </div>
          <div 
            className={`filter-tab ${filter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setFilter('ACTIVE')}
          >
            Active
          </div>
          <div 
            className={`filter-tab ${filter === 'BLOCKED' ? 'active' : ''}`}
            onClick={() => setFilter('BLOCKED')}
          >
            Blocked
          </div>
        </div>

        <div className="user-search">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="search-btn" onClick={() => setSearch('')}>
            {search ? 'Clear' : 'Search'}
          </button>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#feeceb', color: '#dc3545', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p>Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px' }}>
            <p>No users found matching your search criteria.</p>
          </div>
        ) : (
          <div className="loan-list">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.nasabah_id}>
                    <td>{user.nama}</td>
                    <td>{user.email}</td>
                    <td>
                      <div className={`user-status ${user.status === 'AKTIF' ? 'active' : 'blocked'}`}>
                        {user.status === 'AKTIF' ? 'Active' : 'Blocked'}
                      </div>
                    </td>
                    <td>
                      <label className="user-toggle">
                        <input 
                          type="checkbox" 
                          checked={user.status === 'AKTIF'}
                          onChange={() => openConfirmModal(
                            user, 
                            user.status === 'AKTIF' ? 'TIDAK AKTIF' : 'AKTIF'
                          )}
                          disabled={processingUserId === user.nasabah_id}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedUser && newStatus && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Status Change</h2>
              <button className="close-button" onClick={() => setShowConfirmModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p>
                Are you sure you want to change {selectedUser.nama}'s status to{' '}
                <strong>{newStatus === 'AKTIF' ? 'ACTIVE' : 'BLOCKED'}</strong>?
              </p>
              {newStatus === 'TIDAK AKTIF' && (
                <div style={{ backgroundColor: '#feeceb', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                  <p style={{ margin: 0, color: '#dc3545' }}>
                    <strong>Warning:</strong> Blocking this user will prevent them from logging in and accessing their account.
                  </p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className={`action-btn ${newStatus === 'AKTIF' ? 'approve' : 'reject'}`}
                onClick={handleUpdateStatus}
              >
                {newStatus === 'AKTIF' ? 'Activate User' : 'Block User'}
              </button>
              <button 
                className="action-btn"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;