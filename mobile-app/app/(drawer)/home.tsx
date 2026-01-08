import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import Markdown from "react-native-markdown-display";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";

// --- Lucide Icons (Standard Import) ---
import {
  Camera,
  Dog,
  Heart,
  LayoutGrid,
  User,
  ArrowRight,
  Activity,
  Shield,
  Info,
  Bell,
  Search,
  Settings,
  Send,
  LoaderCircle as Loader2,
  MessageSquare,
  ChevronLeft,
  X,
  Bone,
  Sparkles,
  Lightbulb,
  Calendar,
  Plus,
  Menu as MenuIcon,
  ClipboardList,
  Users,
  Save,
  Trash2,
  LogOut,
  CircleCheckBig as CheckCircle2,
  FileText,
} from "lucide-react-native";

// --- Constants & Config ---
const MODEL_NAME = "gemini-2.5-flash-preview-09-2025";
const API_URL = "http://10.0.2.2:5000/api/analyze"; // Android Emulator Host IP

const colors = {
  primary: "#7C5135",
  primaryDark: "#543927",
  accent: "#E8A398",
  accentSoft: "#F8C8C0",
  bg: "#FAF7F2",
  textMain: "#2D241E",
  textMuted: "#8D8178",
  white: "#FFFFFF",
  stone50: "#FAFAFA",
  stone100: "#F5F5F4",
  stone200: "#E7E5E4",
  stone300: "#D6D3D1",
  stone400: "#A8A29E",
  stone800: "#292524",
  stone900: "#1C1917",
  rose50: "#FFF1F2",
  rose400: "#FB7185",
  green50: "#F0FDF4",
  green600: "#16A34A",
  amber400: "#FBBF24",
};

const TRIVIA_DATA = [
  "Köpekler yaklaşık 250 kelimeyi ve el hareketini anlayabilme kapasitesine sahiptir.",
  "Kedilerin burun izleri, tıpkı insanların parmak izleri gibi her birey için eşsizdir.",
  "Bir köpeğin koku alma duyusu, insanlara kıyasla yaklaşık 100.000 kat daha güçlüdür.",
];

// --- Components ---

const CustomPawIcon = ({ size = 24, color = "currentColor", style }: any) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={color}
    style={style}
  >
    <Path d="M12 21.5c-3 0-6-1.5-6-5 0-3 2-5 6-5s6 2 6 5c0 3.5-3 5-6 5z" />
    <Circle cx="7.5" cy="10.5" r="1.8" />
    <Circle cx="10" cy="8" r="2" />
    <Circle cx="14" cy="8" r="2" />
    <Circle cx="16.5" cy="10.5" r="1.8" />
  </Svg>
);

const PawPattern = () => (
  <View style={styles.patternContainer} pointerEvents="none">
    <View style={styles.patternGrid}>
      {Array.from({ length: 12 }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.patternItem,
            {
              transform: [
                { rotate: i % 2 === 0 ? "15deg" : "-15deg" },
                { translateY: i % 2 === 0 ? 8 : 0 },
              ],
            },
          ]}
        >
          <CustomPawIcon size={80} color={colors.accentSoft} />
        </View>
      ))}
    </View>
  </View>
);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  // State
  const [view, setView] = useState<
    | "home"
    | "pets"
    | "compatibility"
    | "notes"
    | "settings"
    | "result"
    | "analysis"
    | "form"
  >("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [aiResponse, setAiResponse] = useState<{
    title: string;
    content: string;
  } | null>(null);

  // Data State
  const [pets, setPets] = useState([
    { id: 1, name: "Luna", breed: "Golden Retriever", age: "3" },
    { id: 2, name: "Milo", breed: "Tekir Kedi", age: "1" },
  ]);
  const [notes, setNotes] = useState<
    { id: number; date: string; text: string }[]
  >([
    {
      id: 1,
      date: "2025-12-20",
      text: "Luna yıllık aşılarını oldu, iştahı yerinde.",
    },
  ]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [compatibilityInput, setCompatibilityInput] = useState({
    p1: "",
    p2: "",
  });
  const [currentTrivia, setCurrentTrivia] = useState(0);

  // Trivia Loop
  useEffect(() => {
    if (view !== "home") return;
    const timer = setInterval(() => {
      setCurrentTrivia((prev) => (prev + 1) % TRIVIA_DATA.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [view]);

  // Handlers
  const handleCompatibilityCheck = async () => {
    if (!compatibilityInput.p1 || !compatibilityInput.p2) {
      Alert.alert("Eksik Bilgi", "Lütfen her iki türü de giriniz.");
      return;
    }
    setIsAnalyzing(true);
    // Mock Response
    setTimeout(() => {
      setIsAnalyzing(false);
      setAiResponse({
        title: "Uyum Analiz Raporu",
        content: `**${compatibilityInput.p1} ve ${compatibilityInput.p2} Uyumu**\n\nBu iki tür arasındaki etkileşim, doğru sosyalleştirme ile yönetilebilir. \n\n*   **Enerji Seviyeleri:** Farklılık gösterebilir.\n*   **Bölgecilik:** İlk tanışma kontrollü ortamda yapılmalı.\n*   **Öneri:** Kokularını birbirlerine önceden tanıtın.`,
      });
      setView("result");
    }, 2000);
  };

  const handleAddNote = () => {
    if (!userInput.trim()) return;
    const newNote = { id: Date.now(), date: selectedDate, text: userInput };
    setNotes([newNote, ...notes]);
    setUserInput("");
    Alert.alert("Başarılı", "Not kaydedildi.");
  };

  const navigateTo = (newView: any) => {
    setView(newView);
    setIsMenuOpen(false);
  };

  // --- Image Analysis (Real Backend) ---
  const pickImage = async () => {
    // İzin iste (Garanti olsun)
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.status === "denied") {
      Alert.alert(
        "İzin Gerekli",
        "Fotoğraf seçmek için galeri izni vermelisiniz."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8, // Performans için biraz sıkıştır
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      performAnalysis(imageUri);
    }
  };

  const performAnalysis = async (imageUri: string) => {
    setIsAnalyzing(true);

    try {
      // 1. Dosyayı Base64'e çevir
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: "base64",
      });

      // 2. JSON olarak gönder (Backend böyle bekliyor)
      const payload = {
        image: `data:image/jpeg;base64,${base64}`,
        userData: {
          ownerName: "Pati Sever",
          living: "Apartman Dairesi", // Bu verileri kullanıcıdan veya profilden alabiliriz
        },
      };

      const response = await axios.post(API_URL, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 180000, // 60 sn (Base64 işlemi uzun sürebilir)
      });

      if (response.data && response.data.advice) {
        setAiResponse({
          title: `Analiz: ${response.data.breed || "Bilinmiyor"}`,
          content: response.data.advice,
        });
        setView("result");
      } else {
        Alert.alert("Hata", "Analiz sonucu boş döndü.");
      }
    } catch (error: any) {
      console.error("Analiz Hatası:", error);
      const errorMessage = error.response
        ? `Sunucu Hatası: ${error.response.status}`
        : error.message;
      Alert.alert(
        "Bağlantı Hatası",
        `Sunucuya bağlanılamadı.\nDetay: ${errorMessage}`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- Render ---
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <PawPattern />

      {/* --- SIDE DRAWER (Modal) --- */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setIsMenuOpen(false)}
            activeOpacity={1}
          />

          <View style={[styles.drawerContent, { paddingTop: insets.top }]}>
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderTop}>
                <View style={styles.drawerLogo}>
                  <CustomPawIcon size={26} color="#fff" />
                </View>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                  <X size={24} color={colors.stone300} />
                </TouchableOpacity>
              </View>
              <View style={styles.drawerUser}>
                <View style={styles.userAvatar}>
                  <User size={28} color={colors.stone300} />
                </View>
                <View>
                  <Text style={styles.userName}>Pati Sever</Text>
                  <Text style={styles.userBadge}>PREMIUM ÜYE</Text>
                </View>
              </View>
            </View>

            <ScrollView
              style={styles.drawerMenu}
              contentContainerStyle={{ gap: 8 }}
            >
              {[
                { id: "home", label: "Ana Panel", icon: LayoutGrid },
                { id: "pets", label: "Hayvanlarım", icon: Dog },
                { id: "compatibility", label: "Uyum Analizi", icon: Users },
                { id: "form", label: "Kayıt Formu", icon: FileText },
                { id: "notes", label: "Gelişim Notları", icon: ClipboardList },
                { id: "settings", label: "Profil Ayarları", icon: Settings },
              ].map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.drawerItem,
                    view === item.id && styles.drawerItemActive,
                  ]}
                  onPress={() => navigateTo(item.id)}
                >
                  <item.icon
                    size={20}
                    color={view === item.id ? colors.stone800 : colors.stone400}
                    strokeWidth={view === item.id ? 2.5 : 2}
                  />
                  <Text
                    style={[
                      styles.drawerItemText,
                      view === item.id && styles.drawerItemTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.drawerFooter}>
              <TouchableOpacity style={styles.logoutBtn}>
                <LogOut size={20} color={colors.stone300} />
                <Text style={styles.logoutText}>Oturumu Kapat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- HEADER --- */}
      <View style={[styles.header, { marginTop: insets.top }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setIsMenuOpen(true)}
          >
            <MenuIcon size={24} color={colors.stone400} strokeWidth={2.5} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerSub}>AI DIVISION</Text>
            <Text style={styles.headerTitle}>PAWMATE</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.bellBtn}>
          <Bell size={22} color={colors.stone400} />
          <View style={styles.bellBadge} />
        </TouchableOpacity>
      </View>

      {/* --- CONTENT --- */}
      <View style={styles.mainContent}>
        <ScrollView
          key={view}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* HOME VIEW */}
          {view === "home" && (
            <View>
              <Text style={styles.pageTitle}>
                Teknik {"\n"}
                <Text style={{ color: colors.primary }}>Kontrol Paneli</Text>
              </Text>

              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
              >
                <View style={{ zIndex: 10 }}>
                  <View style={styles.systemBadge}>
                    <Text style={styles.systemBadgeText}>SISTEM ÇEVRIMIÇI</Text>
                  </View>
                  <Text style={styles.heroCardTitle}>Görsel Tarama</Text>
                  <Text style={styles.heroCardDesc}>
                    Biyometrik veriler için tarayıcıyı aktif edin.
                  </Text>
                  <TouchableOpacity style={styles.heroBtn} onPress={pickImage}>
                    <Camera size={18} color="#333" />
                    <Text style={styles.heroBtnText}>Başlat</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              <View style={styles.shortcutGrid}>
                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => setView("compatibility")}
                >
                  <View
                    style={[
                      styles.shortcutIcon,
                      { backgroundColor: colors.rose50 },
                    ]}
                  >
                    <Users size={22} color={colors.rose400} />
                  </View>
                  <Text style={styles.shortcutTitle}>Uyum Analizi</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shortcutCard}
                  onPress={() => setView("notes")}
                >
                  <View
                    style={[
                      styles.shortcutIcon,
                      { backgroundColor: colors.stone50 },
                    ]}
                  >
                    <ClipboardList size={22} color={colors.stone400} />
                  </View>
                  <Text style={styles.shortcutTitle}>Gelişim Notları</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.triviaCard}>
                <View style={{ zIndex: 10 }}>
                  <View style={styles.triviaHeader}>
                    <Lightbulb size={20} color={colors.amber400} />
                    <Text style={styles.triviaLabel}>TEKNİK BİLGİ</Text>
                  </View>
                  <Text style={styles.triviaText}>
                    "{TRIVIA_DATA[currentTrivia]}"
                  </Text>
                </View>
                <View style={styles.triviaIndicator}>
                  {TRIVIA_DATA.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        i === currentTrivia && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* PETS VIEW */}
          {view === "pets" && (
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Hayvanlarım</Text>
                <TouchableOpacity style={styles.addBtn}>
                  <Plus size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {pets.map((pet) => (
                <View key={pet.id} style={styles.petCard}>
                  <View style={styles.petIconBox}>
                    <CustomPawIcon size={40} color={colors.stone200} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petBreed}>{pet.breed}</Text>
                    <View style={styles.petTags}>
                      <View style={styles.tag}>
                        <Text style={styles.tagText}>{pet.age} Yaş</Text>
                      </View>
                      <View
                        style={[
                          styles.tag,
                          { backgroundColor: colors.green50 },
                        ]}
                      >
                        <CheckCircle2 size={10} color={colors.green600} />
                        <Text
                          style={[
                            styles.tagText,
                            { color: colors.green600, marginLeft: 4 },
                          ]}
                        >
                          Sağlıklı
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity>
                    <Settings size={20} color={colors.stone300} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* NOTES VIEW */}
          {view === "notes" && (
            <View>
              <Text style={styles.sectionTitle}>Gelişim Notları</Text>
              <Text style={styles.sectionDesc}>
                Veteriner ziyareti öncesi tarihsel gelişim verileri.
              </Text>

              <View style={styles.datePickerCard}>
                <View style={styles.dateIconBox}>
                  <Calendar size={20} color={colors.stone400} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>KAYIT TARİHİ</Text>
                  <TextInput
                    style={styles.dateInput}
                    value={selectedDate}
                    onChangeText={setSelectedDate}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              <View style={styles.noteInputCard}>
                <TextInput
                  style={styles.noteInput}
                  multiline
                  placeholder="Gelişmeleri buraya yazın..."
                  value={userInput}
                  onChangeText={setUserInput}
                />
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleAddNote}
                >
                  <Save size={18} color="#fff" />
                  <Text style={styles.saveBtnText}>Kaydı Tamamla</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>GEÇMİŞ KAYITLAR</Text>
                <View style={styles.divider} />
              </View>

              {notes.filter((n) => n.date === selectedDate).length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>
                    Bu tarih için kayıt bulunamadı.
                  </Text>
                </View>
              )}

              {notes
                .filter((n) => n.date === selectedDate)
                .map((note) => (
                  <View key={note.id} style={styles.noteItem}>
                    <Text style={styles.noteText}>{note.text}</Text>
                    <View style={styles.noteFooter}>
                      <View style={styles.dateBadge}>
                        <Text style={styles.dateBadgeText}>{note.date}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() =>
                          setNotes(notes.filter((n) => n.id !== note.id))
                        }
                      >
                        <Trash2 size={16} color={colors.stone300} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
            </View>
          )}

          {/* COMPATIBILITY VIEW */}
          {view === "compatibility" && (
            <View>
              <Text style={styles.sectionTitle}>Uyum Analizi</Text>
              <Text style={styles.sectionDesc}>
                İki farklı türün veya cinsin bir arada yaşama potansiyeli.
              </Text>

              <View style={styles.compContainer}>
                <View style={styles.compInputCard}>
                  <Text style={styles.inputLabel}>BİRİNCİ DENEK</Text>
                  <View style={styles.compInputRow}>
                    <View style={styles.compIconBox}>
                      <Dog size={18} color={colors.stone400} />
                    </View>
                    <TextInput
                      style={styles.compInput}
                      placeholder="Örn: Alman Çoban Köpeği"
                      value={compatibilityInput.p1}
                      onChangeText={(t) =>
                        setCompatibilityInput({ ...compatibilityInput, p1: t })
                      }
                    />
                  </View>
                </View>

                <View style={styles.heartConnector}>
                  <View style={styles.heartCircle}>
                    <Heart
                      size={24}
                      color={colors.rose400}
                      fill={colors.rose400}
                    />
                  </View>
                </View>

                <View style={styles.compInputCard}>
                  <Text style={styles.inputLabel}>İKİNCİ DENEK</Text>
                  <View style={styles.compInputRow}>
                    <View style={styles.compIconBox}>
                      <Dog size={18} color={colors.stone400} />
                    </View>
                    <TextInput
                      style={styles.compInput}
                      placeholder="Örn: British Shorthair"
                      value={compatibilityInput.p2}
                      onChangeText={(t) =>
                        setCompatibilityInput({ ...compatibilityInput, p2: t })
                      }
                    />
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.analyzeBtn}
                onPress={handleCompatibilityCheck}
              >
                <Text style={styles.analyzeBtnText}>Analizi Derle</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* LOADER */}
          {isAnalyzing && (
            <View style={styles.loaderView}>
              <ActivityIndicator size="large" color={colors.stone300} />
              <Text style={styles.loaderTitle}>Veri İşleniyor</Text>
              <Text style={styles.loaderDesc}>
                Gemini AI biyometrik katmanları tarıyor...
              </Text>
            </View>
          )}

          {/* RESULT VIEW */}
          {view === "result" && aiResponse && (
            <View>
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Shield size={24} color={colors.primary} />
                  <Text style={styles.resultTitle}>{aiResponse.title}</Text>
                </View>
                <Markdown>{aiResponse.content}</Markdown>
              </View>
              <TouchableOpacity
                style={styles.analyzeBtn}
                onPress={() => setView("home")}
              >
                <Text style={styles.analyzeBtnText}>Geri Dön</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* SETTINGS VIEW */}
          {view === "settings" && (
            <View>
              <Text style={styles.sectionTitle}>Profil Ayarları</Text>
              <View style={styles.profileHeader}>
                <View style={styles.largeAvatar}>
                  <User size={48} color={colors.stone300} />
                </View>
                <TouchableOpacity style={styles.changePhotoBtn}>
                  <Text style={styles.changePhotoText}>GÖRSELİ DEĞİŞTİR</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.compInputCard, { marginBottom: 20 }]}>
                <Text style={styles.inputLabel}>KULLANICI TANIMI</Text>
                <TextInput
                  style={styles.settingsInput}
                  defaultValue="Pati Sever"
                />
              </View>
              <View style={[styles.compInputCard, { marginBottom: 20 }]}>
                <Text style={styles.inputLabel}>E-POSTA PROTOKOLÜ</Text>
                <TextInput
                  style={styles.settingsInput}
                  defaultValue="kullanici@pawmate.com"
                />
              </View>

              <TouchableOpacity style={styles.analyzeBtn}>
                <Text style={styles.analyzeBtnText}>Ayarları Kaydet</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* FORM VIEW */}
          {view === "form" && (
            <View>
              <Text style={styles.sectionTitle}>Evcil Hayvan Kaydı</Text>
              <Text style={styles.sectionDesc}>
                Yeni bir dostunuzun profilini oluşturun.
              </Text>

              <View style={styles.compInputCard}>
                <Text style={styles.inputLabel}>AD & CİNS</Text>
                <View style={{ gap: 16 }}>
                  <View style={styles.compInputRow}>
                    <View style={styles.compIconBox}>
                      <Dog size={18} color={colors.stone400} />
                    </View>
                    <TextInput
                      style={styles.compInput}
                      placeholder="Evcil Hayvanın Adı"
                    />
                  </View>
                  <View style={styles.compInputRow}>
                    <View style={styles.compIconBox}>
                      <Sparkles size={18} color={colors.stone400} />
                    </View>
                    <TextInput
                      style={styles.compInput}
                      placeholder="Cinsi (Örn: Golden)"
                    />
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
                <View style={[styles.compInputCard, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>CİNSİYET</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        padding: 12,
                        backgroundColor: colors.stone100,
                        borderRadius: 12,
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{ fontWeight: "bold", color: colors.stone800 }}
                      >
                        Dişi
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        padding: 12,
                        backgroundColor: colors.stone50,
                        borderRadius: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.stone200,
                      }}
                    >
                      <Text
                        style={{ fontWeight: "bold", color: colors.stone400 }}
                      >
                        Erkek
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={[styles.compInputCard, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>YAŞ</Text>
                  <View style={styles.compInputRow}>
                    <TextInput
                      style={styles.compInput}
                      placeholder="0"
                      keyboardType="numeric"
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: colors.stone400,
                      }}
                    >
                      YAŞ
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 16, marginTop: 16 }}>
                <View style={[styles.compInputCard, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>KİLO</Text>
                  <View style={styles.compInputRow}>
                    <TextInput
                      style={styles.compInput}
                      placeholder="0.0"
                      keyboardType="numeric"
                    />
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color: colors.stone400,
                      }}
                    >
                      KG
                    </Text>
                  </View>
                </View>
                <View style={[styles.compInputCard, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>SON AŞI</Text>
                  <View style={styles.compInputRow}>
                    <TextInput style={styles.compInput} placeholder="Tarih" />
                  </View>
                </View>
              </View>

              <View style={[styles.compInputCard, { marginTop: 16 }]}>
                <Text style={styles.inputLabel}>VETERİNER KAYDI / NOTLAR</Text>
                <TextInput
                  style={[
                    styles.compInput,
                    { height: 80, textAlignVertical: "top" },
                  ]}
                  multiline
                  placeholder="Herhangi bir sağlık sorunu veya not..."
                />
              </View>

              <TouchableOpacity
                style={[styles.analyzeBtn, { marginTop: 24 }]}
                onPress={() => {
                  Alert.alert("Başarılı", "Kayıt oluşturuldu!");
                  setView("pets");
                }}
              >
                <Text style={styles.analyzeBtnText}>Kaydı Tamamla</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      {/* --- BOTTOM NAV --- */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 10 }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setView("home")}
        >
          <LayoutGrid
            size={24}
            color={view === "home" ? colors.stone900 : colors.stone300}
            strokeWidth={view === "home" ? 3 : 2}
          />
          <Text
            style={[styles.navText, view === "home" && styles.navTextActive]}
          >
            AKIŞ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navCameraContainer} onPress={pickImage}>
          <Camera size={34} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setView("notes")}
        >
          <ClipboardList
            size={24}
            color={view === "notes" ? colors.stone900 : colors.stone300}
            strokeWidth={view === "notes" ? 3 : 2}
          />
          <Text
            style={[styles.navText, view === "notes" && styles.navTextActive]}
          >
            NOTLAR
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    overflow: "hidden",
    zIndex: -1,
  },
  patternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 12,
  },
  patternItem: {
    margin: 20,
  },
  // Modal Drawer
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(28, 25, 23, 0.4)",
    flexDirection: "row",
  },
  modalBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  drawerContent: {
    backgroundColor: "#fff",
    width: "80%",
    height: "100%",
    borderTopRightRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
    elevation: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  drawerHeader: {
    padding: 32,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: colors.stone50,
    backgroundColor: "rgba(250, 250, 250, 0.5)",
  },
  drawerHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  drawerLogo: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  drawerUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.stone100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.stone800,
  },
  userBadge: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.stone300,
    letterSpacing: 1,
    marginTop: 2,
  },
  drawerMenu: {
    flex: 1,
    padding: 24,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 16,
  },
  drawerItemActive: {
    backgroundColor: colors.stone50,
  },
  drawerItemText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.stone400,
  },
  drawerItemTextActive: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.stone800,
  },
  drawerFooter: {
    padding: 32,
    borderTopWidth: 1,
    borderTopColor: colors.stone50,
  },
  logoutBtn: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.stone300,
  },
  // Main Header
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuBtn: {
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stone100,
  },
  headerSub: {
    fontSize: 9,
    fontWeight: "900",
    color: colors.stone400,
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.textMain,
    letterSpacing: -1,
  },
  bellBtn: {
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stone100,
    position: "relative",
  },
  bellBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    backgroundColor: colors.rose400,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  // Content
  mainContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 24,
    color: colors.stone900,
  },
  heroCard: {
    borderRadius: 44,
    padding: 32,
    marginBottom: 32,
    position: "relative",
    overflow: "hidden",
  },
  systemBadge: {
    backgroundColor: "rgba(255,255,255,0.1)",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  systemBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  heroCardTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  heroCardDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 40,
    maxWidth: 200,
    lineHeight: 20,
  },
  heroBtn: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
  },
  heroBtnText: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.stone800,
  },
  shortcutGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  shortcutCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.8)",
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.stone100,
  },
  shortcutIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  shortcutTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.stone800,
  },
  triviaCard: {
    backgroundColor: colors.stone900,
    borderRadius: 40,
    padding: 32,
    position: "relative",
    overflow: "hidden",
  },
  triviaHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  triviaLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.stone400,
    letterSpacing: 2,
  },
  triviaText: {
    fontSize: 15,
    fontWeight: "500",
    color: "rgba(255,255,255,0.9)",
    lineHeight: 24,
    fontStyle: "italic",
    minHeight: 60,
  },
  triviaIndicator: {
    position: "absolute",
    top: 32,
    right: 32,
    flexDirection: "row",
    gap: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  activeDot: {
    width: 16,
    backgroundColor: colors.amber400,
  },
  // Pets Styles
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.stone900,
  },
  addBtn: {
    padding: 12,
    backgroundColor: colors.stone900,
    borderRadius: 16,
  },
  petCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.stone100,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 16,
  },
  petIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.stone50,
    justifyContent: "center",
    alignItems: "center",
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.stone800,
  },
  petBreed: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.stone400,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  petTags: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.stone50,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  tagText: {
    fontSize: 10,
    fontWeight: "bold",
    color: colors.stone800,
  },
  // Notes Styles
  sectionDesc: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.stone400,
    marginBottom: 32,
  },
  datePickerCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.stone100,
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  dateIconBox: {
    padding: 12,
    backgroundColor: colors.stone50,
    borderRadius: 12,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.stone300,
    letterSpacing: 2,
    marginBottom: 4,
  },
  dateInput: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.stone800,
  },
  noteInputCard: {
    backgroundColor: "#fff",
    padding: 28,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.stone100,
    marginBottom: 32,
  },
  noteInput: {
    height: 120,
    fontSize: 14,
    color: colors.stone800,
    textAlignVertical: "top",
    marginBottom: 24,
    lineHeight: 22,
  },
  saveBtn: {
    backgroundColor: colors.stone900,
    paddingVertical: 16,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  historyTitle: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.stone300,
    letterSpacing: 2,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.stone100,
  },
  emptyState: {
    padding: 48,
    borderWidth: 2,
    borderColor: colors.stone100,
    borderStyle: "dashed",
    borderRadius: 32,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12,
    color: colors.stone300,
    fontWeight: "500",
  },
  noteItem: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.stone50,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 15,
    color: colors.stone800,
    lineHeight: 24,
    marginBottom: 16,
  },
  noteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateBadge: {
    backgroundColor: colors.stone50,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dateBadgeText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.stone300,
  },
  // Compatibility Styles
  compContainer: {
    gap: 24,
    marginBottom: 32,
  },
  compInputCard: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.stone100,
  },
  compInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  compIconBox: {
    padding: 12,
    backgroundColor: colors.stone50,
    borderRadius: 12,
  },
  compInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.stone800,
  },
  heartConnector: {
    alignItems: "center",
    marginVertical: -12,
    zIndex: 10,
  },
  heartCircle: {
    backgroundColor: colors.rose50,
    padding: 12,
    borderRadius: 50,
    borderWidth: 6,
    borderColor: "#fff",
  },
  analyzeBtn: {
    backgroundColor: colors.stone900,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: "center",
  },
  analyzeBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  // Loader
  loaderView: {
    alignItems: "center",
    paddingVertical: 64,
  },
  loaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 24,
    marginBottom: 8,
  },
  loaderDesc: {
    fontSize: 14,
    color: colors.stone400,
  },
  // Result
  resultCard: {
    backgroundColor: "#fff",
    borderRadius: 44,
    padding: 32,
    borderWidth: 1,
    borderColor: colors.stone100,
    marginBottom: 32,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.stone50,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.stone800,
  },
  // Settings
  profileHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  largeAvatar: {
    width: 112,
    height: 112,
    borderRadius: 40,
    backgroundColor: colors.stone100,
    borderWidth: 4,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    transform: [{ rotate: "3deg" }],
  },
  changePhotoBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.stone100,
    borderRadius: 20,
  },
  changePhotoText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.stone400,
    letterSpacing: 1,
  },
  settingsInput: {
    height: 50,
    backgroundColor: colors.stone50,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "bold",
    color: colors.stone800,
  },
  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderTopWidth: 1,
    borderTopColor: colors.stone100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 48,
    paddingTop: 20,
  },
  navItem: {
    alignItems: "center",
    gap: 6,
  },
  navText: {
    fontSize: 10,
    fontWeight: "900",
    color: colors.stone300,
    letterSpacing: 0.5,
  },
  navTextActive: {
    color: colors.stone900,
  },
  navCameraContainer: {
    marginTop: -80,
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#fff",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
});
