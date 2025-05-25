import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/CSResetPassword.css';

const CSResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [passwordBaru, setPasswordBaru] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if CS is authenticated
  useEffect(() => {
    const token = localStorage.getItem('cs_token');
    if (!token) {
      navigate('/cs/login');
    }
  }, [navigate]);

  const validateForm = () => {
    if (!email || !passwordBaru || !confirmPassword) {
      setError('Semua field harus diisi');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Format email tidak valid');
      return false;
    }

    if (passwordBaru.length < 3) {
      setError('Password minimal 3 karakter');
      return false;
    }

    if (passwordBaru !== confirmPassword) {
      setError('Password tidak cocok');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      const token = localStorage.getItem('cs_token');
      const response = await fetch('http://localhost:3000/api/cs/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, passwordBaru }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Gagal mereset password');
      }

      setMessage(data.message || 'Password berhasil direset');
      setEmail('');
      setPasswordBaru('');
      setConfirmPassword('');
      
      // Auto redirect after success
      setTimeout(() => {
        navigate('/cs/dashboard');
      }, 2000);
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

      <div className="reset-password-container">
        <div className="form-header">
          <div className="form-icon">🔑</div>
          <h2 className="reset-password-title">Reset Password Nasabah</h2>
          <p className="form-description">
            Fitur ini digunakan untuk mereset password nasabah yang mengalami kesulitan akses.
            Pastikan identitas nasabah sudah diverifikasi sebelum melakukan reset.
          </p>
        </div>
        
        <form className="reset-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Nasabah:</label>
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
            <label htmlFor="passwordBaru">Password Baru:</label>
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
            <label htmlFor="confirmPassword">Konfirmasi Password:</label>
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
          
          <button 
            type="submit" 
            className="reset-password-button" 
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Reset Password"}
          </button>
        </form>
        
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default CSResetPassword;