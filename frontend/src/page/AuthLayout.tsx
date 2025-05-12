// AuthLayout.jsx
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <section className="bodyHomeAuth">
        <main className="auth">
          <Outlet /> {/* DI SINI HALAMAN CHILD AKAN DITAMPILKAN */}
        </main>
    </section>
  );
}
