    import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

    const BerhasilTagihanPinjaman = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const message = location.state?.message || 'Berhasil!';
    const delay = location.state?.delay || 3000;

    useEffect(() => {
        const timer = setTimeout(() => {
        navigate('/user/mpayment');
        }, delay);
        return () => clearTimeout(timer);
    }, [navigate, delay]);

    return (
        <div className="success-container">
        <h2>{message}</h2>
        <p>Mengarahkan kembali ke halaman pembayaran...</p>
        </div>
    );
    };

    export default BerhasilTagihanPinjaman;
