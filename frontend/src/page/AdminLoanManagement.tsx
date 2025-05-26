import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Admin.css';

interface Loan {
  pinjaman_id: string;
  jumlahPinjaman: number;
  statusJatuhTempo: string;
  tanggalJatuhTempo: string;
  statusPinjaman: string;
  nasabah: {
    nasabah_id: string;
    nama: string;
    email: string;
  } | null;
}

const AdminLoanManagement: React.FC = () => {
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<Loan[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingLoanId, setProcessingLoanId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchLoans();
  }, [navigate]);

  useEffect(() => {
    if (filter === 'ALL') {
      setFilteredLoans(loans);
    } else {
      setFilteredLoans(loans.filter(loan => loan.statusPinjaman === filter));
    }
  }, [filter, loans]);

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('http://localhost:3000/api/admin/pinjaman/daftar', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch loans');
      }

      const data = await response.json();
      setLoans(data.data || []);
      setFilteredLoans(data.data || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching loans');
      console.error('Error fetching loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessLoan = async (loanId: string, status: 'ACCEPTED' | 'REJECTED') => {
    setProcessingLoanId(loanId);
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`http://localhost:3000/api/admin/pinjaman/${loanId}/konfirmasi`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update loan status');
      }

      // Update local state
      setLoans(prevLoans => 
        prevLoans.map(loan => 
          loan.pinjaman_id === loanId ? { ...loan, statusPinjaman: status } : loan
        )
      );

      // Close modal if open
      if (showModal && selectedLoan?.pinjaman_id === loanId) {
        setShowModal(false);
        setSelectedLoan(null);
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred while processing the loan');
      console.error('Error processing loan:', err);
    } finally {
      setProcessingLoanId(null);
    }
  };

  const viewLoanDetails = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowModal(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTenorText = (tenor: string) => {
    switch (tenor) {
      case '6BULAN': return '6 Months';
      case '12BULAN': return '12 Months';
      case '24BULAN': return '24 Months';
      default: return tenor;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'PENDING': return 'pending';
      case 'ACCEPTED': return 'approved';
      case 'REJECTED': return 'rejected';
      default: return '';
    }
  };

  const getLoanStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'ACCEPTED': return 'Approved';
      case 'REJECTED': return 'Rejected';
      default: return status;
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
            className="menu-item active"
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
          <h1>Loan Management</h1>
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
            All Loans
          </div>
          <div 
            className={`filter-tab ${filter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setFilter('PENDING')}
          >
            Pending
          </div>
          <div 
            className={`filter-tab ${filter === 'ACCEPTED' ? 'active' : ''}`}
            onClick={() => setFilter('ACCEPTED')}
          >
            Approved
          </div>
          <div 
            className={`filter-tab ${filter === 'REJECTED' ? 'active' : ''}`}
            onClick={() => setFilter('REJECTED')}
          >
            Rejected
          </div>
        </div>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#feeceb', color: '#dc3545', borderRadius: '8px', marginBottom: '1rem' }}>
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p>Loading loan data...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px' }}>
            <p>No loans found matching your filter criteria.</p>
          </div>
        ) : (
          <div className="loan-list">
            <table className="loan-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Loan Amount</th>
                  <th>Tenor</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLoans.map((loan) => (
                  <tr key={loan.pinjaman_id}>
                    <td>{loan.nasabah?.nama || 'Unknown'}</td>
                    <td>{formatCurrency(loan.jumlahPinjaman)}</td>
                    <td>{getTenorText(loan.statusJatuhTempo)}</td>
                    <td>{formatDate(loan.tanggalJatuhTempo)}</td>
                    <td>
                      <div className={`status ${getStatusClass(loan.statusPinjaman)}`}>
                        {getLoanStatusText(loan.statusPinjaman)}
                      </div>
                    </td>
                    <td>
                      {loan.statusPinjaman === 'PENDING' ? (
                        <>
                          <button 
                            className="action-btn approve"
                            onClick={() => handleProcessLoan(loan.pinjaman_id, 'ACCEPTED')}
                            disabled={processingLoanId === loan.pinjaman_id}
                          >
                            Approve
                          </button>
                          <button 
                            className="action-btn reject"
                            onClick={() => handleProcessLoan(loan.pinjaman_id, 'REJECTED')}
                            disabled={processingLoanId === loan.pinjaman_id}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <button 
                          className="action-btn view"
                          onClick={() => viewLoanDetails(loan)}
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loan Details Modal */}
      {showModal && selectedLoan && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Loan Details</h2>
              <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="loan-detail">
                <div className="loan-detail-label">Customer Name:</div>
                <div className="loan-detail-value">{selectedLoan.nasabah?.nama || 'Unknown'}</div>
              </div>
              <div className="loan-detail">
                <div className="loan-detail-label">Email:</div>
                <div className="loan-detail-value">{selectedLoan.nasabah?.email || 'Unknown'}</div>
              </div>
              <div className="loan-detail">
                <div className="loan-detail-label">Loan Amount:</div>
                <div className="loan-detail-value">{formatCurrency(selectedLoan.jumlahPinjaman)}</div>
              </div>
              <div className="loan-detail">
                <div className="loan-detail-label">Tenor:</div>
                <div className="loan-detail-value">{getTenorText(selectedLoan.statusJatuhTempo)}</div>
              </div>
              <div className="loan-detail">
                <div className="loan-detail-label">Due Date:</div>
                <div className="loan-detail-value">{formatDate(selectedLoan.tanggalJatuhTempo)}</div>
              </div>
              <div className="loan-detail">
                <div className="loan-detail-label">Status:</div>
                <div className="loan-detail-value">
                  <div className={`status ${getStatusClass(selectedLoan.statusPinjaman)}`}>
                    {getLoanStatusText(selectedLoan.statusPinjaman)}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              {selectedLoan.statusPinjaman === 'PENDING' && (
                <>
                  <button 
                    className="action-btn approve"
                    onClick={() => handleProcessLoan(selectedLoan.pinjaman_id, 'ACCEPTED')}
                  >
                    Approve Loan
                  </button>
                  <button 
                    className="action-btn reject"
                    onClick={() => handleProcessLoan(selectedLoan.pinjaman_id, 'REJECTED')}
                  >
                    Reject Loan
                  </button>
                </>
              )}
              <button 
                className="action-btn"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLoanManagement;