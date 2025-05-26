import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CS.css';
import '../style/CSValidation.css';

const CSValidationPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [verifiedCustomer, setVerifiedCustomer] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      navigate('/cs/login');
    }
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch('http://localhost:3000/api/cs/verify-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Verifikasi gagal');
      }

      setSuccess(true);
      setVerifiedCustomer(data.data);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat memverifikasi');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleViewActivity = () => {
    if (verifiedCustomer) {
      localStorage.setItem('verified_customer', JSON.stringify(verifiedCustomer));
      navigate('/cs/customer-activity');
    }
  };

  return (
    <div className="cs-container validation-container">
      <div className="cs-header">
        <div>
          <h1 className="cs-title">Validasi Data Nasabah</h1>
          <p style={{ color: 'white', opacity: 0.9, marginTop: '0.5rem' }}>
            Customer Service Dashboard
          </p>
        </div>
        <button className="cs-logout" onClick={() => navigate('/cs/dashboard')}>
          Kembali
        </button>
      </div>

      <div className="validation-content">
        <div className="validation-card">
          <div className="validation-card-inner">
            <div className="validation-icon">
              <i className="fas fa-user-shield"></i>
            </div>
            
            {!success ? (
              <form onSubmit={handleSubmit} className="validation-form">
                <p className="form-instruction">
                  Masukkan data nasabah yang perlu diverifikasi
                </p>
                
                <div className="form-group">
                  <label htmlFor="nama">
                    <i className="fas fa-user"></i> Nama Lengkap
                  </label>
                  <input
                    type="text"
                    id="nama"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap nasabah"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i> Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Masukkan email nasabah"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <i className="fas fa-lock"></i> Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Masukkan password nasabah"
                    required
                  />
                </div>

                {error && <div className="validation-error">{error}</div>}

                <button 
                  type="submit" 
                  className="validation-button"
                  disabled={loading}
                >
                  {loading ? 'Memverifikasi...' : 'Verifikasi Nasabah'}
                </button>
              </form>
            ) : (
              <div className="verification-success">
                <div className="success-icon">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3>Verifikasi Berhasil!</h3>
                
                <div className="customer-details">
                  <div className="detail-item">
                    <span className="detail-label">Nama:</span>
                    <span className="detail-value">{verifiedCustomer?.nama}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">No. Rekening:</span>
                    <span className="detail-value">{verifiedCustomer?.noRekening}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Saldo:</span>
                    <span className="detail-value">
                      Rp {verifiedCustomer?.saldo?.toLocaleString('id-ID') || 0}
                    </span>
                  </div>
                </div>
                
                <div className="verification-actions">
                  <button 
                    onClick={handleViewActivity}
                    className="view-activity-button"
                  >
                    <i className="fas fa-chart-line"></i> Lihat Aktivitas Nasabah
                  </button>
                  <button 
                    onClick={() => {
                      setSuccess(false);
                      setFormData({ nama: '', email: '', password: '' });
                    }}
                    className="new-verification-button"
                  >
                    <i className="fas fa-redo"></i> Verifikasi Nasabah Lain
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSValidationPage;