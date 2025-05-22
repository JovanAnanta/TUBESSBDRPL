import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css';

const CSLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/cs/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Login gagal');
      }

      const data = await response.json();
      localStorage.removeItem('token');
      localStorage.removeItem('nasabahId');
      localStorage.setItem('cs_token', data.token);
      localStorage.setItem('cs_name', data.nama);
      navigate('/cs/dashboard');
    } catch (error: any) {
      alert('Gagal login: ' + error.message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-heading">Login CS</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
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
            />
          </div>
          <button type="submit" className="btn btn-login" style={{ marginBottom: '8px' }}>
            Login
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/auth/login')}
          >
            Kembali
          </button>
        </form>
      </div>
    </div>
  );
};

export default CSLogin;
