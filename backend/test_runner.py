import os
import glob
import numpy as np
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image as keras_image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from sklearn.metrics import accuracy_score

# ================= AYARLAR ================= #
IMAGE_DIR = r"C:\Users\pc\OneDrive\Documents\OneDrive\Masaüstü\pawmatesGP\data\archive (1)\images"
CACHE_FILE = "feature_cache_split.npy"
TEST_SPLIT_COUNT = 40  # Son 40 resmi test için ayır
TEST_FEATURE_SIZE = 64
# =========================================== #

def get_model():
    print("📦 MobileNetV2 Modeli Yükleniyor...")
    return MobileNetV2(weights="imagenet", include_top=False, pooling="avg")

def extract_features(model, img_path):
    try:
        img = keras_image.load_img(img_path, target_size=(224, 224))
        x = preprocess_input(np.expand_dims(keras_image.img_to_array(img), axis=0))
        return model.predict(x, verbose=0)[0][:TEST_FEATURE_SIZE]
    except Exception as e:
        # print(f"Hata ({os.path.basename(img_path)}): {e}")
        return np.zeros(TEST_FEATURE_SIZE)

def run_test():
    if not os.path.exists(IMAGE_DIR):
        print("❌ Klasör bulunamadı!")
        return

    model = get_model()
    
    all_files = glob.glob(os.path.join(IMAGE_DIR, "*.jpg"))
    breed_groups = {}
    
    # 1. Dosyaları Grupla
    print("📂 Dosyalar taranıyor...")
    for path in all_files:
        breed = os.path.basename(path).rsplit("_", 1)[0]
        if breed not in breed_groups: breed_groups[breed] = []
        breed_groups[breed].append(path)

    train_data = {} # Hafıza
    test_files = [] # Soru kağıtları
    test_labels = [] # Cevap anahtarı

    # 2. Train/Test Ayrımı Yap
    print(f"✂️  Train/Test Ayrımı Yapılıyor (Son {TEST_SPLIT_COUNT} resim test)...")
    
    for breed, files in breed_groups.items():
        files.sort() # Sıralama önemli
        
        if len(files) > TEST_SPLIT_COUNT:
            # Train: Baştakiler
            train_subset = files[:-TEST_SPLIT_COUNT]
            # Test: Sondaki 40
            test_subset = files[-TEST_SPLIT_COUNT:]
            
            # Train verilerini hafızaya işle
            for f in train_subset:
                feat = extract_features(model, f)
                train_data[f] = feat
            
            # Test verilerini listeye ekle
            for f in test_subset:
                test_files.append(f)
                test_labels.append(breed)
        else:
            print(f"⚠️ {breed}: Yeterli sayı yok, test dışı bırakıldı.")

    print(f"🧠 Eğitim Seti Boyutu: {len(train_data)}")
    print(f"📝 Test Seti Boyutu: {len(test_files)}")
    print("-" * 30)
    print("🚀 Test Başlıyor...")

    # 3. Test İşlemi (Hızlı Kıyaslama)
    train_paths = list(train_data.keys())
    train_feats = np.array(list(train_data.values()))
    train_labels_list = [os.path.basename(p).rsplit("_", 1)[0] for p in train_paths]

    predictions = []
    correct = 0

    for i, test_path in enumerate(test_files):
        # Özellik çıkar
        target_feat = extract_features(model, test_path)
        
        # En yakın komşuyu bul (Nearest Neighbor)
        dists = np.linalg.norm(train_feats - target_feat, axis=1)
        nearest_idx = np.argmin(dists)
        pred_breed = train_labels_list[nearest_idx]
        
        predictions.append(pred_breed)
        
        if pred_breed == test_labels[i]:
            correct += 1
            
        if (i+1) % 50 == 0:
            print(f"   İşlenen: {i+1}/{len(test_files)} (Anlık Doğruluk: %{(correct/(i+1))*100:.1f})")

    # 4. Sonuç
    final_acc = (correct / len(test_files)) * 100
    print("-" * 30)
    print(f"🏆 TEST SONUCU: %{final_acc:.2f}")
    print(f"✅ Doğru: {correct}")
    print(f"❌ Yanlış: {len(test_files) - correct}")
    print("-" * 30)

if __name__ == "__main__":
    run_test()