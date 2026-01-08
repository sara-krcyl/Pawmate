import os
import glob
import numpy as np
import random
import time
import base64
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
import google.generativeai as genai
import PIL.Image
import json
import re
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS

# ================================ CONFIG ================================= #
API_KEY = "AIzaSyDY9Cqc35Fob_hfKJgb5Ir4nCXW1h2jx04"
IMAGE_DIR = r"c:\Pawmate\data\archive (1)\images"
# Sırayla deneyecek model listesi (en hızlıdan başlayarak)
MODEL_NAMES = [
    "models/gemini-2.5-flash",           # En hızlı ve yeni
    "models/gemini-2.0-flash",           # Hızlı alternatif
    "models/gemini-flash-latest",        # Genel alias
]
FEATURE_CACHE_FILE = "feature_cache_64.npy" # Dosya adını sabitledim
TEST_SPEED_MODE = False  #  Tüm görselleri kullan 
TEST_SAMPLE_SIZE = 200   # Speed mode açıksa kullanılır
TEST_FEATURE_SIZE = 64
# =========================================================================== #

print("\nBaşlatılıyor...\n")

# ============================= GEMINI CONFIG ============================== #
llm_available = False
working_model = None

if API_KEY:
    try:
        genai.configure(api_key=API_KEY)
        
        # Her modeli sırayla dene
        for model_name in MODEL_NAMES:
            try:
                test_model = genai.GenerativeModel(model_name)
                # Basit bir test
                # test_response = test_model.generate_content("Hi") # Hız için yorum satırı
                working_model = model_name
                print(f"🔑 Gemini API hazır | Model: {model_name}")
                llm_available = True
                break
            except Exception as e:
                continue
        
        if not llm_available:
            print("⚠ Hiçbir Gemini modeli çalışmadı")
            
    except Exception as e:
        print(f"⚠ Gemini API kullanılamıyor: {e}")
        llm_available = False
else:
    print("⚠ API_KEY tanımlı değil → Sadece CNN modu")

# ============================= DATASET LOAD =============================== #
print(f"📂 Dataset klasörü: {IMAGE_DIR}")
jpg_files = []
if os.path.exists(IMAGE_DIR):
    jpg_files = glob.glob(os.path.join(IMAGE_DIR, "*.jpg"))
    print(f"🐾 Toplam görsel: {len(jpg_files)}")
else:
    print("❌ Görsel klasörü bulunamadı!")

# ============================= MAGNITUDE: Cat/Köpek Ayrımı ================= #
cat_breeds = ["Abyssinian", "Bengal", "Birman", "Bombay", "British_Shorthair", "Egyptian_Mau",
              "Maine_Coon", "Persian", "Ragdoll", "Russian_Blue", "Siamese", "Sphynx"]

# ============================= CNN MODEL LOAD ============================ #
print("\n📦 MobileNetV2 yükleniyor...")
feature_model = MobileNetV2(weights="imagenet", include_top=False, pooling="avg")
print("✔ CNN model hazır.\n")

# ============================= FEATURE EXTRACTION ========================= #
def extract_features(img_path):
    try:
        img = image.load_img(img_path, target_size=(224, 224))
        x = preprocess_input(np.expand_dims(image.img_to_array(img), axis=0))
        features = feature_model.predict(x, verbose=0)[0]
        # 🔥 TEST_FEATURE_SIZE kadar feature al
        return features[:TEST_FEATURE_SIZE] if TEST_FEATURE_SIZE < len(features) else features
    except Exception as e:
        print(f"Feature hatası ({img_path}): {e}")
        return np.zeros(TEST_FEATURE_SIZE)

# ============================= FEATURE CACHE ============================= #
# Burası senin orijinal kodundaki cache oluşturma mantığı
print(f"\n💾 Cache kontrol ediliyor... ({FEATURE_CACHE_FILE})")

if os.path.exists(FEATURE_CACHE_FILE):
    feature_db = np.load(FEATURE_CACHE_FILE, allow_pickle=True).item()
    print(f"⚡ Cache yüklendi ({len(feature_db)} kayıt)")
else:
    print(f"🛠 Cache oluşturuluyor ({TEST_FEATURE_SIZE} feature)...")
    print("   İlk çalıştırma dataset büyüklüğüne göre sürebilir...")
    feature_db = {}
    if jpg_files:
        for i, path in enumerate(jpg_files):
            if i % 100 == 0:
                print(f"   İşlenen: {i}/{len(jpg_files)}")
            feature_db[path] = extract_features(path)
        np.save(FEATURE_CACHE_FILE, feature_db)
        print("✔ Cache oluşturuldu.")
    else:
        print("⚠ Dataset boş olduğu için cache oluşturulamadı.")

# ============================= PROMPT FONKSİYONU ========================== #
def build_prompt(breed, is_cat, user_data):
    animal_type = "kedi" if is_cat else "köpek"
    owner = user_data.get('ownerName', 'Kullanıcı')
    living = user_data.get('living', 'bilinmiyor')
    
    return f"""
    Sen bir veteriner uzmanısın.
    Tespit edilen hayvan: **{animal_type}** ({breed})
    Sahip: {owner}, Yaşam Alanı: {living}

    Lütfen şunları sağla (Türkçe):
    1. Irk hakkında kısa özet
    2. Sahibinin yaşam alanına ({living}) uygunluk durumu
    3. Bakım önerisi
    
    Ton: samimi | uzman.
    """.strip()

# ============================= TAHMİN FONKSİYONU ========================== #
def predict_breed_process(temp_img_path, user_data):
    # ---------------------------------------------------------
    # 1. ÖNCELİK: GEMINI (Görsel Zeka)
    # ---------------------------------------------------------
    if llm_available and working_model:
        max_retries = 3
        retry_delay = 2 # saniye

        for attempt in range(max_retries):
            try:
                print(f"🤖 Gemini Vision analizi başlıyor... ({working_model}) - Deneme {attempt + 1}")
                img_pil = PIL.Image.open(temp_img_path)
                
                model = genai.GenerativeModel(working_model)
                
                prompt = f"""
                Bu resmi analiz et. Hayvanın türünü (kedi/köpek) ve ırkını tespit et.
                Ayrıca sahibinin adı "{user_data.get('ownerName', 'Kullanıcı')}" ve yaşam alanı "{user_data.get('living', 'bilinmiyor')}".
                
                Lütfen yanıtı SADECE aşağıdaki JSON formatında ver:
                {{
                    "breed": "Irk Adı (Örn: Russian Blue)",
                    "animalType": "cat" veya "dog",
                    "confidence": 0.95,
                    "advice": "Veteriner uzmanı olarak hazırladığın Türkçe, samimi ve detaylı öneri metni."
                }}
                """
                
                response = model.generate_content([img_pil, prompt])
                text_response = response.text
                
                # Regex ile JSON bulma (daha güvenli)
                match = re.search(r'\{.*\}', text_response, re.DOTALL)
                img_pil.close() # Dosyayı serbest bırak

                if match:
                    json_str = match.group(0)
                    result_json = json.loads(json_str)
                    
                    print(f"✅ Gemini Başarılı (Retry ve Regex ile): {result_json.get('breed')}")
                    
                    return (
                        result_json.get("breed", "Bilinmiyor"),
                        float(result_json.get("confidence", 0.9)),
                        result_json.get("animalType") == "cat",
                        result_json.get("advice", "Öneri oluşturulamadı.")
                    )
                else:
                    raise ValueError("JSON bulunamadı")
                
            except Exception as e:
                error_str = str(e)
                print(f"⚠ Gemini Vision hatası (Deneme {attempt + 1}): {error_str}")
                
                # Eğer kota hatasıysa (429) bekle ve tekrar dene
                if "429" in error_str or "quota" in error_str.lower():
                    print(f"⏳ Kota limiti aşıldı, {retry_delay} saniye bekleniyor...")
                    time.sleep(retry_delay)
                    retry_delay *= 2 # Exponential backoff (2, 4, 8...)
                else:
                    # Başka bir hataysa günlüğe yaz ve devam et (belki geçici sunucu hatasıdır)
                    with open("gemini_error.log", "a") as f:
                        f.write(f"Attempt {attempt+1}: {error_str}\n")
        
        # Döngü biterse buraya düşer -> Logla ve fallback yap
        print("❌ Tüm denemeler başarısız oldu. Yedek modele geçiliyor.")

    # ---------------------------------------------------------
    # 2. YEDEK: MOBILE NET CNN (Eski Yöntem)
    # ---------------------------------------------------------
    print("running Fallback CNN...")
    target_features = extract_features(temp_img_path)
    
    search_set = list(feature_db.keys())
    # Speed mode kontrolü
    if TEST_SPEED_MODE:
         search_set = random.sample(search_set, min(TEST_SAMPLE_SIZE, len(search_set)))

    best_breed = "Bilinmiyor"
    min_dist = float('inf')
    
    if not search_set:
        return "Bilinmiyor", 0.0, False, "Dataset verisi yok ve LLM başarısız."

    for img_path in search_set:
        db_features = feature_db[img_path]
        dist = np.linalg.norm(target_features - db_features)
        if dist < min_dist:
            min_dist = dist
            best_breed = os.path.basename(img_path).rsplit("_", 1)[0]

    confidence = max(0.01, 1 - min_dist / 12)
    is_cat = best_breed in cat_breeds
    
    # LLM sadece metin için tekrar deneniyor (Resim analizi başarısız olsa bile advice üretebilir mi? Zor, context yok)
    # Basit advice
    advice = f"Sistem şu an görsel zekaya erişemediği için görsel benzerlik analizi yapıldı. Tahmin: {best_breed}"
            
    return best_breed, confidence, is_cat, advice

# ============================= FLASK API ================================== #
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/', methods=['GET'])
def home():
    return "<h1>Pawmates Backend Çalışıyor! 🚀</h1>"

@app.route('/api/analyze', methods=['POST'])
def analyze():
    # BURADA GİRİNTİLERİ DÜZELTTİM 👇
    try:
        data = request.json
        image_data = data.get('image')
        user_data = data.get('userData', {})

        if not image_data:
            return jsonify({"error": "Resim verisi bulunamadı"}), 400

        if "base64," in image_data:
            image_data = image_data.split(",")[1]

        temp_filename = "temp_upload.jpg"
        with open(temp_filename, "wb") as fh:
            fh.write(base64.b64decode(image_data))

        breed, confidence, is_cat, advice = predict_breed_process(temp_filename, user_data)

        if os.path.exists(temp_filename):
            os.remove(temp_filename)

        return jsonify({
            "breed": breed,
            "confidence": float(confidence),
            "animalType": "cat" if is_cat else "dog",
            "advice": advice
        })

    except Exception as e:
        error_msg = str(e)
        print("HATA:", error_msg)
        with open("backend_error.log", "a") as f:
            f.write(f"ROUTE HATA: {error_msg}\n{traceback.format_exc()}\n")
        return jsonify({"error": error_msg}), 500

# 👇 EN ÖNEMLİ EKSİK PARÇA BUYDU 👇
if __name__ == "__main__":
    print("\n🚀 Sunucu hazır: http://0.0.0.0:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)