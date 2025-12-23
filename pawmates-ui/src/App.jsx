import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

function App() {
  // 1. State Tanımları
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    ownerName: "",
    petName: "",
    living: "apartment",
    experience: "beginner",
    children: "no",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 2. Görsel Seçme Fonksiyonu
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // 3. Form Verisi Güncelleme
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 4. Analiz Fonksiyonu (Backend Bağlantısı)
  const analyzePet = async () => {
    if (!image) {
      alert("Lütfen önce bir fotoğraf seçin!");
      return;
    }

    setLoading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: reader.result,
            userData: formData,
          }),
        });

        if (!response.ok) {
          throw new Error("Sunucu hatası! Backend çalışıyor mu?");
        }

        const data = await response.json();
        setResult(data);
      } catch (error) {
        console.error("Hata:", error);
        alert(
          "Bağlantı hatası! Lütfen 'main.py' sunucusunun açık olduğundan emin olun."
        );
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(image);
  };

  // 5. Ekran Tasarımı (JSX)
  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      {/* BAŞLIK */}
      <h1
        style={{
          textAlign: "center",
          color: "#2E7D32",
          marginBottom: "30px",
          fontSize: "2.5rem",
        }}
      >
        🐾 Pawmates Pet Analyzer
      </h1>

      {/* GÖRSEL YÜKLEME ALANI */}
      <div
        style={{
          textAlign: "center",
          background: "#ffffff",
          padding: "30px",
          borderRadius: "15px",
          border: "2px dashed #a5d6a7",
          marginBottom: "20px",
        }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ marginBottom: "15px" }}
        />
        {preview && (
          <div>
            <img
              src={preview}
              alt="Seçilen"
              style={{
                maxWidth: "100%",
                maxHeight: "300px",
                borderRadius: "12px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
              }}
            />
          </div>
        )}
      </div>

      {/* FORM ALANI */}
      <div
        style={{
          display: "grid",
          gap: "15px",
          background: "#f1f8e9",
          padding: "25px",
          borderRadius: "15px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", color: "#388e3c" }}>
          👤 Kullanıcı Bilgileri
        </h3>

        <input
          name="ownerName"
          placeholder="Adınız Soyadınız"
          onChange={handleInputChange}
          style={inputStyle}
        />
        <input
          name="petName"
          placeholder="Evcil Hayvanın Adı (Varsa)"
          onChange={handleInputChange}
          style={inputStyle}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
          }}
        >
          <select name="living" onChange={handleInputChange} style={inputStyle}>
            <option value="apartment">Apartman Dairesi</option>
            <option value="garden">Bahçeli Ev</option>
            <option value="farm">Çiftlik / Geniş Arazi</option>
          </select>

          <select
            name="children"
            onChange={handleInputChange}
            style={inputStyle}
          >
            <option value="no">Çocuk Yok</option>
            <option value="yes">Çocuk Var</option>
          </select>
        </div>

        <select
          name="experience"
          onChange={handleInputChange}
          style={inputStyle}
        >
          <option value="beginner">İlk Kez Besleyeceğim</option>
          <option value="experienced">Deneyimliyim</option>
        </select>
      </div>

      {/* BUTON */}
      <button
        onClick={analyzePet}
        disabled={loading}
        style={{
          width: "100%",
          padding: "15px",
          marginTop: "25px",
          backgroundColor: loading ? "#90a4ae" : "#2E7D32", // Koyu yeşil
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontSize: "18px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          transition: "background 0.3s",
        }}
      >
        {loading ? "⏳ Analiz Ediliyor..." : "🔍 ANALİZ ET"}
      </button>

      {/* 📊 SONUÇ ALANI (YENİLENMİŞ TASARIM) */}
      {result && (
        <div
          style={{
            marginTop: "40px",
            padding: "30px",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 15px 40px rgba(0,0,0,0.1)", // Derin gölge
            border: "1px solid #e0e0e0",
          }}
        >
          {/* Sonuç Başlığı */}
          <div
            style={{
              textAlign: "center",
              borderBottom: "3px solid #4CAF50",
              paddingBottom: "20px",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                color: "#1B5E20",
                fontSize: "32px",
                margin: 0,
                textTransform: "capitalize",
              }}
            >
              {result.breed} {result.animalType === "cat" ? "🐱" : "🐶"}
            </h2>
            <div
              style={{
                display: "inline-block",
                background: "#e8f5e9",
                color: "#2e7d32",
                padding: "5px 15px",
                borderRadius: "20px",
                marginTop: "10px",
                fontWeight: "bold",
              }}
            >
              Güven Skoru: %{Math.round(result.confidence * 100)}
            </div>
          </div>

          {/* Yapay Zeka Metni - BURASI index.css'ten besleniyor */}
          <div className="markdown-content">
            <ReactMarkdown>{result.advice}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

// Input stilleri
const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px",
  width: "100%",
  boxSizing: "border-box", // Inputların taşmasını engeller
};

export default App;
