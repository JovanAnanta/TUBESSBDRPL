    import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../style/Tagihan.css";

interface TagihanFormData {
  selectedWilayah: string;
  nomorTagihan: string;
}

// Data tagihan dummy untuk demo
const billDatabase = {
  // Data Air PDAM
  "PDAM88899900": { amount: 200000, customerName: "John Doe" },
  "PDAM88899901": { amount: 150000, customerName: "Jane Smith" },
  "PDAM88899902": { amount: 300000, customerName: "Bob Johnson" },
  "PDAM88899903": { amount: 175000, customerName: "Alice Brown" },
  
  // Data Listrik PLN
  "PLN88899900": { amount: 350000, customerName: "John Doe" },
  "PLN88899901": { amount: 280000, customerName: "Jane Smith" },
  "PLN88899902": { amount: 420000, customerName: "Bob Johnson" },
  "PLN88899903": { amount: 190000, customerName: "Alice Brown" },
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
    setFormData(prev => ({ ...prev, nomorTagihan: e.target.value }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulasi delay API call
    setTimeout(() => {
      const billInfo = billDatabase[formData.nomorTagihan as keyof typeof billDatabase];
      
      if (billInfo) {
        // Navigasi ke halaman preview dengan data tagihan
        navigate('/user/tagihan/preview', {
          state: {
            type: type,
            region: formData.selectedWilayah,
            nomorTagihan: formData.nomorTagihan,
            amount: billInfo.amount,
            customerName: billInfo.customerName,
            statusTagihanType: currentConfig.statusTagihanType, // Sesuai dengan model enum
          }
        });
      } else {
        setError("Nomor tagihan tidak ditemukan. Silakan periksa kembali.");
      }
      setLoading(false);
    }, 1000);
  };  return (
    <div className={`tagihan-container ${type?.toLowerCase()}`}>
      <h2 className="tagihan-title">{currentConfig.title}</h2>
      
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

      {/* Info section */}
      <div className="info-section">
        <h4>Contoh Nomor Tagihan:</h4>
        <ul>
          <li>{currentConfig.prefix}88899900 - Rp 200.000</li>
          <li>{currentConfig.prefix}88899901 - Rp 150.000</li>
          <li>{currentConfig.prefix}88899902 - Rp 300.000</li>
          <li>{currentConfig.prefix}88899903 - Rp 175.000</li>
        </ul>
      </div>

      <button
        className="tagihan-back-button"
        onClick={() => navigate("/user/mpayment")}
      >
        Kembali
      </button>
    </div>
  );
};
