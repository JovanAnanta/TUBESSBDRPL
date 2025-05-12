import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nama: "",
    email: "",
    password: "",
    noRekening: "",
    pin: null,
    saldo: 0,
    kodeAkses: ""
  });

  // Inisialisasi navigate di luar handleSubmit
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const form = new FormData();
    
    form.append("nama", formData.nama);
    form.append("email", formData.email);
    form.append("password", formData.password);
    form.append("noRekening", formData.noRekening);
    form.append("saldo", formData.saldo.toString());
    form.append("kodeAkses", formData.kodeAkses);

  fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(formData)
  })
    .then(async (res) => {
      if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error?.error || error?.message || `HTTP ${res.status}`);
    }
      return res.json();
    })
    .then((data) => {
      alert("Pendaftaran berhasil");
      navigate("/auth/login");
    })
    .catch((err) => {
      console.error("Detail error:", err);
      alert("Gagal registrasi: " + err.message);
    });
};


  return (
    <section className="bodyRegis">

    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label htmlFor="nama">Nama</label>
        <input type="text" name="nama" id="nama" required onChange={handleChange} />

        <label htmlFor="email">Email</label>
        <input type="email" name="email" id="email" required onChange={handleChange} />

        <label htmlFor="password">Password</label>
        <input type="password" name="password" id="password" required onChange={handleChange} />

        <label htmlFor="kodeAkses">Kode Akses</label>
        <input type="text" name="kodeAkses" id="kodeAkses" required onChange={handleChange} />

        <button type="submit" className="button1">Register</button>
        <Link to="/auth/login">
          <button className="button3">Log In Page</button>
        </Link>
      </form>

    </div>
    </section>
  );
};

export default RegisterForm;