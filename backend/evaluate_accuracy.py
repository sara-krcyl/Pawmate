import numpy as np
import os
import random
from sklearn.metrics import classification_report, accuracy_score

# ================= AYARLAR ================= #
CACHE_FILE = "feature_cache_64.npy"
TEST_RATIO = 0.20  # %20 Test, %80 Train
# =========================================== #

def get_breed_from_path(path):
    # Dosya adından ırkı ayıklar (Örn: n02099601_golden_retriever_01.jpg -> golden_retriever)
    filename = os.path.basename(path)
    # Genelde format: Irk_Ismi_Numara.jpg
    # Sondaki numarayı ve uzantıyı atıyoruz
    breed = filename.rsplit("_", 1)[0]
    return breed

def evaluate():
    print(f"📊 Model Başarı Testi Başlatılıyor...")
    
    # 1. Cache Dosyasını Yükle
    if not os.path.exists(CACHE_FILE):
        print("❌ Cache dosyası bulunamadı! Önce main.py'yi çalıştırıp cache oluşturmalısın.")
        return

    data = np.load(CACHE_FILE, allow_pickle=True).item()
    all_paths = list(data.keys())
    total_images = len(all_paths)
    
    print(f"📂 Toplam Görsel Sayısı: {total_images}")

    # 2. Veriyi Rastgele Karıştır (Shuffle)
    # Sabit sonuç almak için seed koyabiliriz (random.seed(42)) ama gerçekçi olsun diye koymuyoruz.
    random.shuffle(all_paths)

    # 3. 80/20 Ayır
    split_index = int(total_images * (1 - TEST_RATIO))
    train_paths = all_paths[:split_index]
    test_paths = all_paths[split_index:]

    print(f"🧠 Eğitim Seti (Train - Hafıza): {len(train_paths)} görsel")
    print(f"📝 Test Seti (Sorgulanacak): {len(test_paths)} görsel")
    print("-" * 40)

    # 4. Test Başlasın
    y_true = [] # Gerçek ırklar
    y_pred = [] # Tahmin edilen ırklar

    correct_count = 0

    print("🚀 Test ediliyor... (Bu işlem birkaç saniye sürebilir)")

    # Eğitim veritabanını hazırlayalım (Hız için)
    train_features = np.array([data[p] for p in train_paths])
    train_labels = [get_breed_from_path(p) for p in train_paths]

    for i, test_img in enumerate(test_paths):
        # Gerçek ırk
        actual_breed = get_breed_from_path(test_img)
        
        # Test resminin özellikleri
        target_vector = data[test_img]

        # En yakın komşuyu bul (Dataset içinde)
        # (Vektör farklarının karesini alıp kökünü buluyoruz - Öklid Uzaklığı)
        distances = np.linalg.norm(train_features - target_vector, axis=1)
        nearest_index = np.argmin(distances)
        
        predicted_breed = train_labels[nearest_index]

        # Listelere ekle
        y_true.append(actual_breed)
        y_pred.append(predicted_breed)

        if actual_breed == predicted_breed:
            correct_count += 1

        # İlerleme çubuğu gibi her 100 resimde bir yaz
        if (i + 1) % 100 == 0:
            print(f"   Processed {i + 1}/{len(test_paths)}...")

    # 5. Sonuçları Raporla
    accuracy = (correct_count / len(test_paths)) * 100
    print("-" * 40)
    print(f"🏆 GENEL DOĞRULUK ORANI (ACCURACY): %{accuracy:.2f}")
    print("-" * 40)
    
    # Detaylı rapor istersek (opsiyonel, çok uzun olabilir)
    # print(classification_report(y_true, y_pred))

if __name__ == "__main__":
    evaluate()