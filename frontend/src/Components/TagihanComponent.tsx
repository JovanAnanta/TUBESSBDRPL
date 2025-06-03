import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style/Tagihan.css";

interface TagihanFormData {
  selectedWilayah: string;
  nomorTagihan: string;
}

// Data tagihan dummy untuk demo (amount only, no hardcoded customer names)
const billDatabase = {
  // Data Air PDAM
  "PDAM88899900": { amount: 200000 },
  "PDAM88899901": { amount: 150000 },
  "PDAM88899902": { amount: 300000 },
  "PDAM88899903": { amount: 175000 },
  
  // Data Listrik PLN
  "PLN88899900": { amount: 350000 },
  "PLN88899901": { amount: 280000 },
  "PLN88899902": { amount: 420000 },
  "PLN88899903": { amount: 190000 },
};

export const TagihanComponent = () => {
  const { type } = useParams<{ type: string }>();
  const [formData, setFormData] = useState<TagihanFormData>({
    selectedWilayah: "",
    nomorTagihan: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Daftar wilayah yang tersedia
  const availableRegions = [
    "Jakarta Pusat",
    "Jakarta Selatan", 
    "Jakarta Utara",
    "Jakarta Barat",
    "Jakarta Timur",
    "Bandung",
    "Surabaya",
    "Medan",
    "Yogyakarta",
    "Semarang",
    "Makassar",
    "Palembang"
  ];  const getConfig = () => {
    if (type === 'air') {
      return {
        title: "Input Data Tagihan Air",
        nomorLabel: "Nomor Tagihan PDAM",
        placeholder: "Contoh: PDAM88899900",
        prefix: "PDAM",
        buttonText: "Cek Tagihan",
        statusTagihanType: "AIR" as const,
      };
    } else {
      return {
        title: "Input Data Tagihan Listrik",
        nomorLabel: "Nomor Meter PLN",
        placeholder: "Contoh: PLN88899900", 
        prefix: "PLN",
        buttonText: "Cek Tagihan",
        statusTagihanType: "LISTRIK" as const,
      };
    }
  };

  const currentConfig = getConfig();

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, selectedWilayah: e.target.value }));
  };
  const handleTagihanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Input validation to prevent cross-type inputs
    const currentConfig = getConfig();
    const isWaterBill = currentConfig.prefix === 'PDAM';
    const isElectricBill = currentConfig.prefix === 'PLN';
    
    // Check for invalid prefix combinations
    if (isWaterBill && value.toUpperCase().startsWith('PLN')) {
      setError("PLN prefix tidak valid untuk tagihan air. Gunakan prefix PDAM untuk tagihan air.");
      return;
    }
    
    if (isElectricBill && value.toUpperCase().startsWith('PDAM')) {
      setError("PDAM prefix tidak valid untuk tagihan listrik. Gunakan prefix PLN untuk tagihan listrik.");
      return;
    }
    
    setFormData(prev => ({ ...prev, nomorTagihan: value }));
    setError("");
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const billInfo = billDatabase[formData.nomorTagihan as keyof typeof billDatabase];
      
      if (!billInfo) {
        setError("Nomor tagihan tidak ditemukan. Silakan periksa kembali.");
        setLoading(false);
        return;
      }

      // Get token for API calls
      const token = localStorage.getItem('token');
      if (!token) {
        setError("Token tidak ditemukan. Silakan login kembali.");
        setLoading(false);
        return;
      }      // Check payment eligibility first
      const eligibilityResponse = await fetch(`/api/tagihan/cek-kelayakan/${type}/${formData.nomorTagihan}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Debug: log response details
      console.log('Eligibility response status:', eligibilityResponse.status);
      console.log('Eligibility response ok:', eligibilityResponse.ok);

      if (!eligibilityResponse.ok) {
        // Handle different HTTP status codes
        if (eligibilityResponse.status === 401) {
          setError("Session telah berakhir. Silakan login kembali.");
        } else if (eligibilityResponse.status === 400) {
          setError("Format nomor tagihan tidak valid.");
        } else if (eligibilityResponse.status === 500) {
          setError("Terjadi kesalahan server. Silakan coba lagi.");
        } else {
          setError(`Gagal memeriksa kelayakan pembayaran (${eligibilityResponse.status}). Silakan coba lagi.`);
        }
        setLoading(false);
        return;
      }

      const eligibilityData = await eligibilityResponse.json();
      console.log('Eligibility data:', eligibilityData);
      
      // If payment is not eligible, show alert and don't proceed
      if (!eligibilityData.eligible) {
        alert(eligibilityData.message || "Anda tidak dapat membayar tagihan ini saat ini.");
        setLoading(false);
        return;
      }

      // Fetch customer data from API
      const response = await fetch('/api/user/getDataNasabah', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        setError("Gagal mengambil data nasabah.");
        setLoading(false);
        return;
      }

      const userData = await response.json();
      let customerName = "Nasabah"; // fallback
      
      // Extract customer name from API response
      if (userData.data && userData.data.nama) {
        customerName = userData.data.nama;
      } else if (userData.response_data && userData.response_data.data && userData.response_data.data.nama) {
        customerName = userData.response_data.data.nama;
      } else if (userData.nama) {
        customerName = userData.nama;
      }

      // Navigate to preview with real customer data
      navigate('/user/tagihan/preview', {
        state: {
          type: type,
          region: formData.selectedWilayah,
          nomorTagihan: formData.nomorTagihan,
          amount: billInfo.amount,
          customerName: customerName,
          statusTagihanType: currentConfig.statusTagihanType,
        }
      });

    } catch (error) {
      console.error('Error processing bill:', error);
      setError("Terjadi kesalahan saat memproses tagihan.");
    }
    
    setLoading(false);
  };return (
    <div className="tagihan-container">
      <div className="tagihan-wrapper">
        <div className="tagihan-header">
          <div className="tagihan-icon">🧾</div>
          <h1 className="tagihan-title">{currentConfig.title}</h1>
          <p className="tagihan-subtitle">Silakan masukkan detail tagihan Anda</p>
        </div>

        <div className="tagihan-card">
          <form onSubmit={handleSubmit} className="tagihan-form">
            {/* Dropdown Wilayah */}
            <div className="form-group">
              <label htmlFor="wilayah-select">Pilih Wilayah:</label>
              <select
                id="wilayah-select"
                value={formData.selectedWilayah}
                onChange={handleRegionChange}
                required
                className="region-dropdown"
              >
                <option value="">-- Pilih Wilayah --</option>
                {availableRegions.map((region, index) => (
                  <option key={index} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <small className="input-hint">
                Pilih wilayah tempat tinggal Anda
              </small>
            </div>

            {/* Input Nomor Tagihan */}
            <div className="form-group">
              <label htmlFor="nomorTagihan">{currentConfig.nomorLabel}:</label>
              <input
                id="nomorTagihan"
                type="text"
                value={formData.nomorTagihan}
                onChange={handleTagihanChange}
                required
                placeholder={currentConfig.placeholder}
              />
              {error && <span className="error-message">{error}</span>}
              <small className="input-hint">
                Masukkan nomor tagihan sesuai format {currentConfig.prefix}
              </small>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !formData.nomorTagihan || !formData.selectedWilayah}
            >
              {loading ? "Mengecek..." : currentConfig.buttonText}
            </button>
          </form>
        </div>

        <div className="back-button-container">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span className="back-icon">←</span>
            <span>Kembali</span>
          </button>
        </div>
      </div>
    </div>
  );
};
