import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CSResetPassword.css';

const CSResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [nama, setNama] = useState('');
  const [noRekening, setNoRekening] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState<any>(null);

  // Check if CS is authenticated
  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      navigate('/cs/login');
    }
  }, [navigate]);

  const validateVerificationForm = () => {
    if (!email || !nama || !noRekening) {
      setError('Semua field harus diisi');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      return false;
    }

    return true;
  };

  const validatePasswordForm = () => {
    if (!passwordBaru || !confirmPassword) {
      setError('Kedua field password harus diisi');
      return false;
    }

    if (passwordBaru.length < 3) {
      setError('Password minimal 3 karakter');
      return false;
    }

    if (passwordBaru !== confirmPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return false;
    }

    return true;
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validateVerificationForm()) return;
    
    setIsLoading(true);

    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch('http://localhost:3000/api/cs/verify-nasabah', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          email,
          nama,
          noRekening 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal memverifikasi nasabah');
      }

      setVerifiedUser(data.data);
      setMessage('Verifikasi berhasil. Silakan masukkan password baru.');
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Data nasabah tidak ditemukan atau tidak sesuai');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validatePasswordForm()) return;
    
    setIsLoading(true);

    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch('http://localhost:3000/api/cs/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          email,
          nama,
          noRekening,
          passwordBaru 
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mereset password');
      }

      setMessage(data.message || 'Password berhasil direset');
      
      // Clear form fields
      setEmail('');
      setNama('');
      setNoRekening('');
      setPasswordBaru('');
      setConfirmPassword('');
      setVerifiedUser(null);
      setStep(1);
      
      // Auto redirect after success
      setTimeout(() => {
        navigate('/cs/dashboard');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat mereset password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cs-container">
      <div className="cs-header">
        <div>
          <h1 className="cs-title">Reset Password Nasabah</h1>
          <p style={{ color: 'white', opacity: 0.9, marginTop: '0.5rem' }}>
            Customer Service Dashboard
          </p>
        </div>
        <button className="cs-logout" onClick={() => navigate('/cs/dashboard')}>
          Kembali
        </button>
      </div>

      <div className="validation-content">
        <div className="reset-password-container">
          <div className="reset-password-inner">
            <div className="form-header">
              <div className="form-icon">🔑</div>
              <h2 className="reset-password-title">Reset Password Nasabah</h2>
              <p className="form-description">
                {step === 1 
                  ? "Fitur ini digunakan untuk mereset password nasabah yang mengalami kesulitan akses. Harap verifikasi identitas nasabah terlebih dahulu."
                  : "Nasabah terverifikasi. Silakan masukkan password baru untuk akun ini."
                }
              </p>
            </div>
            
            {step === 1 ? (
              <>
                <div className="step-indicator">
                  <div className="step active">1. Verifikasi Nasabah</div>
                  <div className="step">2. Reset Password</div>
                </div>
                
                <form className="reset-password-form" onSubmit={handleVerification}>
                  <div className="form-group">
                    <label htmlFor="email">
                      <i className="fas fa-envelope"></i> Email Nasabah
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email nasabah"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="nama">
                      <i className="fas fa-user"></i> Nama Nasabah
                    </label>
                    <input
                      type="text"
                      id="nama"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Masukkan nama lengkap nasabah"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="noRekening">
                      <i className="fas fa-credit-card"></i> Nomor Rekening
                    </label>
                    <input
                      type="text"
                      id="noRekening"
                      value={noRekening}
                      onChange={(e) => setNoRekening(e.target.value)}
                      placeholder="Masukkan nomor rekening nasabah"
                      required
                    />
                  </div>
                  
                  {error && <div className="error-message">{error}</div>}
                  {message && <div className="success-message">{message}</div>}
                  
                  <button 
                    type="submit" 
                    className="reset-password-button" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Memverifikasi..." : "Verifikasi Nasabah"}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="step-indicator">
                  <div className="step completed">1. Verifikasi Nasabah</div>
                  <div className="step active">2. Reset Password</div>
                </div>
                
                {verifiedUser && (
                  <div className="verified-user-info">
                    <h3>Data Nasabah:</h3>
                    <div className="user-info-item">
                      <span className="info-label">Nama:</span>
                      <span className="info-value">{verifiedUser.nama}</span>
                    </div>
                    <div className="user-info-item">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{verifiedUser.email}</span>
                    </div>
                    <div className="user-info-item">
                      <span className="info-label">No. Rekening:</span>
                      <span className="info-value">{verifiedUser.noRekening}</span>
                    </div>
                  </div>
                )}
                
                <form className="reset-password-form" onSubmit={handleResetPassword}>
                  <div className="form-group">
                    <label htmlFor="passwordBaru">
                      <i className="fas fa-lock"></i> Password Baru
                    </label>
                    <div className="password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="passwordBaru"
                        value={passwordBaru}
                        onChange={(e) => setPasswordBaru(e.target.value)}
                        placeholder="Masukkan password baru"
                        required
                      />
                      <button 
                        type="button" 
                        className="password-toggle" 
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="confirmPassword">
                      <i className="fas fa-lock"></i> Konfirmasi Password
                    </label>
                    <div className="password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Konfirmasi password baru"
                        required
                      />
                    </div>
                  </div>
                  
                  {error && <div className="error-message">{error}</div>}
                  {message && <div className="success-message">{message}</div>}
                  
                  <div className="form-actions">
                    <button 
                      type="button" 
                      className="back-button" 
                      onClick={() => setStep(1)}
                    >
                      <i className="fas fa-arrow-left"></i> Kembali
                    </button>
                    <button 
                      type="submit" 
                      className="reset-password-button" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Memproses..." : "Reset Password"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSResetPassword;