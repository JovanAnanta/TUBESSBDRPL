import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import defaultProfile from '../assets/profileImage.jpeg';


const UserLayout = () => {

  return (
    <section className="bodyHomeAuth">
        <main className="auth">
          <Outlet /> {/* DI SINI HALAMAN CHILD AKAN DITAMPILKAN */}
        </main>
    </section>
  );
};

export default UserLayout;
