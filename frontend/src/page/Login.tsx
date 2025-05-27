import { useState } from 'react'; // useEffect dan konstanta kode rahasia CS sebelumnya tidak lagi diperlukan di sini
import { useNavigate, Link } from 'react-router-dom';
import "../style/Login.css"; // Pastikan path ini benar

// --- KREDENSIAL CS YANG DIKENALI DI FRONTEND (SANGAT TIDAK AMAN UNTUK PRODUKSI!) ---
// Ganti nilai ini dengan kode akses dan password yang Anda inginkan untuk "membuka"
// jalur ke halaman login CS. Ingat, ini hanya untuk pengalihan di frontend.
const CS_ACCESS_CODE_FRONTEND = "Cs@S3cR!tX"; // Contoh
const CS_PASSWORD_FRONTEND = "Pw%@V53&p*";   // Contoh
// ------------------------------------------------------------------------------------

// Fungsi login nasabah, akan dipanggil jika kredensial tidak cocok dengan kredensial CS di atas
export const login = async (kodeAkses: string, password: string, lat?: number, long?: number) => {
  try {
    const response = await fetch("http://localhost:3000/api/auth/loginNasabah", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kodeAkses, password, lat, long }),
    });

    const responseData = await response.json(); // Selalu parse JSON sekali

    if (!response.ok) {
      console.error('Login failed response (from backend):', responseData);
      // Backend diharapkan mengirimkan pesan error yang bisa digunakan.
      // Jika tidak ada, atau jika kita ingin pesan generik, kita akan tangani di catch.
      throw new Error(responseData.message || 'Login gagal, coba lagi');
    }
    return responseData;
  } catch (error) {
    console.error('Request error or backend error:', error);
    // Lempar error agar bisa ditangkap oleh handleSubmit
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Terjadi kesalahan saat menghubungi server.');
  }
};

const LoginForm = () => {
  const [formData, setFormData] = useState({ kodeAkses: "", password: "" });
  const navigate = useNavigate();

  // State untuk role, CS prompt, dan kode rahasia CS sudah dihilangkan

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { kodeAkses, password } = formData;

    // Langkah 1: Periksa apakah kredensial yang dimasukkan cocok dengan kredensial CS (frontend check)
    if (kodeAkses === CS_ACCESS_CODE_FRONTEND && password === CS_PASSWORD_FRONTEND) {
      // Jika cocok, langsung arahkan ke halaman login CS.
      // Halaman /cs/login kemudian akan melakukan validasi backend yang sebenarnya.
      // Tidak ada panggilan API ke loginNasabah untuk kasus ini.
      console.log("Kredensial CS (frontend check) cocok. Mengarahkan ke /cs/login...");
      localStorage.removeItem("token"); // Bersihkan token nasabah jika ada
      localStorage.removeItem("nasabahId");
      // Opsional: Anda bisa set item di localStorage untuk memberi tahu /cs/login
      // bahwa pengguna datang dari jalur ini, jika diperlukan.
      // localStorage.setItem("csLoginAttemptSource", "mainLoginForm");
      navigate('/cs/login');
      return; // Hentikan eksekusi handleSubmit lebih lanjut
    }

    // Langkah 2: Jika tidak cocok dengan kredensial CS di frontend, coba login sebagai nasabah biasa
    let lat: number | undefined;
    let long: number | undefined;

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = position.coords.latitude;
        long = position.coords.longitude;
      } catch (error) {
        console.warn("Lokasi tidak diizinkan atau gagal diakses:", error);
      }
    }

    try {
      console.log("Mencoba login sebagai nasabah biasa...");
      const data = await login(kodeAkses, password, lat, long);

      // Login nasabah berhasil (berdasarkan respons dari backend)
      localStorage.removeItem("cs_token"); // Hapus data CS lama jika ada
      localStorage.removeItem('cs_name');

      if (data.status !== 'AKTIF') {
        alert(data.message || 'Akun Anda tidak aktif atau diblokir.');
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("nasabahId", data.nasabah_id);

      if (data.pinStatus === 'empty') {
        navigate("/user/set-pin");
      } else {
        navigate("/user", { replace: true });
      }
      alert(`Login berhasil! Selamat datang, ${data.nama}`);

    } catch (err: any) {
      // Jika login nasabah gagal (misalnya, kode akses/password nasabah salah),
      // tampilkan pesan error generik sesuai permintaan.
      console.error('Error saat login nasabah:', err);
      alert('Kode Akses atau Password salah.');
    }
  };

  // Fungsi-fungsi terkait role dan CS prompt sudah dihilangkan

  return (
    <div className="login-page-wrapper">
      <div className="login-wrapper">
        <div className="login-card">
          <h2 className="login-heading">Selamat Datang</h2> {/* Judul umum */}

          {/* Tombol pemilih peran (role-selector) sudah dihilangkan */}
          {/* Modal/prompt untuk kode rahasia CS kedua juga sudah dihilangkan */}

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
              <button type="button" className="btn btn-secondary">Register Nasabah Baru</button>
            </Link>
          </form>
        </div>
      </div>

      {/* Tombol Informasi Banking */}
      <Link to="/info-layanan" className="info-banking-button">
        ℹ Info Layanan
      </Link>
    </div>
  );
};

export default LoginForm;