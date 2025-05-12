import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import defaultProfile from '../assets/profileImage.jpeg';

type Nasabah = {
  nama: string;
  email: string;
  noRekening: string;
  saldo: number;
  profileImage: string;
  pin: string;
  kodeAkses: string;
};

const UserLayout = () => {
  const [nasabah, setNasabah] = useState<Nasabah | null>(null);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchNasabahData(token);
    } else {
      navigate('/auth/login'); // jika tidak ada token, redirect
    }
  }, []);

  const fetchNasabahData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3000/api/nasabah', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data nasabah');
      }

      const data = await response.json();
      setNasabah(data.data);
    } catch (error) {
      setError('Terjadi kesalahan saat mengambil data nasabah');
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setNasabah(null);
    navigate('/login');
  };

  return (
    <section className="bodyHomeAuth">
        <main className="auth">
          <Outlet /> {/* DI SINI HALAMAN CHILD AKAN DITAMPILKAN */}
        </main>
    </section>
  );
};

export default UserLayout;
