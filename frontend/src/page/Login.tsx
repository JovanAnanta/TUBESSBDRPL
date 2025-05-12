import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { encrypt,decrypt } from '../../../backend/enkripsi/Encryptor';

export const login = async (kodeAkses: string, password: string) => {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kodeAkses, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Login failed response:', errorData);
      throw new Error(errorData.message || 'Login gagal, coba lagi');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Request error:', error);
    throw new Error(error instanceof Error ? error.message : 'An unknown error occurred');
  }
};

const LoginForm = () => {
  const [formData, setFormData] = useState({ kodeAkses: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const data = await login(formData.kodeAkses, formData.password);
      localStorage.setItem("token", data.token);

      if (data.pinStatus === 'empty') {
        navigate("/user/set-pin");  // Arahkan ke halaman set PIN
      } else {
        navigate("/user");  // Arahkan ke halaman utama
      }
      
      localStorage.setItem("nasabahId", data.nasabah_id);
      alert(`Login berhasil! Selamat datang, ${data.nama}`);
    } catch (err: any) {
      console.error('Error on login submit:', err);
      alert('Login gagal: ' + err.message);
    }
  };

  return (
    <div className="bodyLogin">
      <div className="login-container">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              type="text"
              id="kodeAkses"
              name="kodeAkses"
              value={formData.kodeAkses}
              onChange={handleChange}
              placeholder="Kode Akses"
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />
          </div>
          <button type="submit" className="button">Login</button>
          <Link to="/auth/register">
            <button className="button5">Register</button>
          </Link>
          <Link to="/">
            <button className="button6">Home here</button>
          </Link>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
