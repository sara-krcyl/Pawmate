import os
import glob

# ================= AYARLAR ================= #
# Resimlerin olduğu klasör
IMAGE_DIR = r"C:\Users\pc\OneDrive\Documents\OneDrive\Masaüstü\pawmatesGP\data\archive (1)\images"
TEST_COUNT = 40  # Son 40 resim
# =========================================== #

def listeyi_olustur():
    if not os.path.exists(IMAGE_DIR):
        print("❌ HATA: Resim klasörü bulunamadı!")
        print(f"Aranan yol: {IMAGE_DIR}")
        return

    print("📂 Dosyalar taranıyor...")
    all_files = glob.glob(os.path.join(IMAGE_DIR, "*.jpg"))
    
    if not all_files:
        print("❌ Klasör boş veya jpg dosyası yok.")
        return

    breed_groups = {}
    
    # Gruplama
    for path in all_files:
        breed = os.path.basename(path).rsplit("_", 1)[0]
        if breed not in breed_groups:
            breed_groups[breed] = []
        breed_groups[breed].append(path)

    test_files = []

    # Son 40'ı seçme
    print(f"✂️  Her ırkın son {TEST_COUNT} fotoğrafı ayrılıyor...")
    for breed, files in breed_groups.items():
        files.sort() # Sıralama
        if len(files) > TEST_COUNT:
            # Son 40 tanesini al
            test_files.extend(files[-TEST_COUNT:])

    # Dosyayı yazma
    output_file = "TEST_LISTESI.txt"
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"=== BU DOSYALAR TEST İÇİN AYRILDI (TOPLAM: {len(test_files)}) ===\n")
        f.write("Sistem bu resimleri hafızasına ALMADI. Buradan seçip yüklersen %100 çıkmaz.\n\n")
        for path in test_files:
            f.write(f"{path}\n")

    print("-" * 30)
    print(f"✅ BAŞARILI! Liste oluşturuldu: {len(test_files)} resim.")
    print(f"📄 Dosya şurada: {os.path.abspath(output_file)}")
    print("-" * 30)

if __name__ == "__main__":
    listeyi_olustur()