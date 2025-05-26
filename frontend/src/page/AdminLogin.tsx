import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login gagal');
      }

      // Clear any existing tokens
      localStorage.removeItem('token');
      localStorage.removeItem('nasabahId');
      localStorage.removeItem('cs_token');
      localStorage.removeItem('cs_name');
      
      // Set admin tokens
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_name', data.nama);
      
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (error: any) {
      setError(error.message || 'Gagal login, silakan coba lagi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-heading">Admin Login</h2>

        {error && (
          <div className="error-message" style={{ 
            backgroundColor: '#FEE2E2', 
            color: '#DC2626', 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <input
              type="email"
              name="email"
              placeholder="Email Admin"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              disabled={loading}
            />
          </div>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-login" 
            style={{ marginBottom: '8px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => navigate('/cs/login')}
              disabled={loading}
            >
              CS Login
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => navigate('/auth/login')}
              disabled={loading}
            >
              Nasabah Login
            </button>
          </div>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          Administrator Area | Bank System Management
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
