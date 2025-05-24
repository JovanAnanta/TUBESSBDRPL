import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "../style/Login.css";

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
  const [role, setRole] = useState<'nasabah' | 'cs'>('nasabah');
  const [formData, setFormData] = useState({ kodeAkses: "", password: "" });
  const navigate = useNavigate();
  const SECRET_CODE = "a%*h^7(j$80^#$";
  const SECRET_CODE2 = "a%*h^7(j$80^#$";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.kodeAkses === SECRET_CODE || formData.password === SECRET_CODE2) {
      navigate("/cs/login");
      return;
    }

    try {
      const data = await login(formData.kodeAkses, formData.password);
      localStorage.removeItem("cs_token");

      // Cek status nasabah dari response
      if (data.status !== 'AKTIF') {
        alert('Akun Anda sedang diblokir. Silakan hubungi customer service untuk informasi lebih lanjut.');
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("nasabahId", data.nasabah_id);
      
      if (data.pinStatus === 'empty' || data.pinStatus === '') {
        navigate("/user/set-pin");  // Arahkan ke halaman set PIN
      } else {
        navigate("/user");  // Arahkan ke halaman utama
      }

      alert(`Login berhasil! Selamat datang, ${data.nama}`);
    } catch (err: any) {
      console.error('Error on login submit:', err);
      
      // Cek apakah error adalah akun yang diblokir
      if (err.message && err.message.includes('diblokir')) {
        alert(`⚠️ ${err.message}`);
      } else {
        alert('Login gagal: ' + err.message);
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2 className="login-heading">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <input
              type="text"
              id="kodeAkses"
              name="kodeAkses"
              value={formData.kodeAkses}
              onChange={handleChange}
              placeholder="Kode Akses"
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-login">Login</button>
          <Link to="/auth/register">
            <button type="button" className="btn btn-secondary">Register</button>
          </Link>
        </form>
      </div>
    </div>

  );
};

export default LoginForm;
