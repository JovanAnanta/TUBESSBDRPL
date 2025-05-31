import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../style/Login.css'; // Pastikan path ini benar dan file CSS ini ada

const CSLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null); // Tambahkan state untuk error
  const [loading, setLoading] = useState(false); // Tambahkan state untuk loading
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null); // Hapus error saat pengguna mengetik
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/cs/login', { // Pastikan endpoint ini sesuai
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json(); // Selalu parse JSON sekali

      if (!response.ok) {
        throw new Error(data.message || 'Login CS gagal');
      }

      // Hapus token-token lain yang mungkin sudah ada
      localStorage.removeItem('token');
      localStorage.removeItem('nasabahId');
      localStorage.removeItem('admin_token'); // Hapus token admin jika ada
      localStorage.removeItem('admin_name');  // Hapus nama admin jika ada
      
      // Set token dan nama CS
      localStorage.setItem('cs_token', data.token);
      localStorage.setItem('cs_name', data.nama); // Asumsi backend mengembalikan 'nama'
      
      console.log('Token CS:', data.token);
      console.log('CS Name:', data.nama);
      navigate('/cs/dashboard'); // Arahkan ke dashboard CS
    } catch (error: any) {
      setError(error.message || 'Gagal login CS, silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper"> {/* Menggunakan class yang sama dengan AdminLogin */}
      <div className="login-card"> {/* Menggunakan class yang sama dengan AdminLogin */}
        
        <h2 className="login-heading">Customer Service Login</h2>

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
              placeholder="Email CS"
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
            className="btn btn-login" // Tombol login utama
            style={{ marginBottom: '8px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          {/* Tombol Navigasi di bawah form, mengikuti gaya AdminLogin.tsx */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary" // Tombol sekunder
              style={{ flex: 1 }}
              onClick={() => navigate('/admin/login')} // Navigasi ke Admin Login
              disabled={loading}
            >
              Admin Login
            </button>
            <button
              type="button"
              className="btn btn-secondary" // Tombol sekunder
              style={{ flex: 1 }}
              onClick={() => navigate('/auth/login')} // Navigasi ke Nasabah Login
              disabled={loading}
            >
              Nasabah Login
            </button>
          </div>
        </form>
        
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '14px', color: '#666' }}>
          Customer Service Area | Bank System Support
        </div>
      </div>
    </div>
  );
};

export default CSLogin;