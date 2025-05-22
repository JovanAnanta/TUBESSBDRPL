import React, { useState } from 'react';
import '../style/Report.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface ReportFormProps {
  onClose: () => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    deskripsi: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      const response = await fetch('http://localhost:3000/api/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error('Gagal membuat laporan');
      }

      toast.success('🎉 Laporan berhasil dibuat!', {
        position: "top-right",
        autoClose: 5555,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      
      setTimeout(() => {
        onClose();
      }, 3555); // Increased to 3 seconds before closing

    } catch (error) {
      toast.error(`❌ ${(error as Error).message}`, {
        position: "top-right",
        autoClose: 6555,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">Buat Laporan</h2>
            <button className="modal-close" onClick={onClose}>&times;</button>
          </div>
          <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Masukkan email Anda"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="deskripsi">Deskripsi Masalah:</label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                className="form-textarea"
                value={formData.deskripsi}
                onChange={handleChange}
                required
                placeholder="Jelaskan masalah yang Anda alami..."
              />
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Mengirim...' : 'Kirim Laporan'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReportForm;