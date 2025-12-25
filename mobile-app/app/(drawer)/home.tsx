
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Image, Platform, Dimensions, Alert, ActivityIndicator
} from 'react-native';
// @ts-ignore
import Camera from 'lucide-react-native/dist/cjs/icons/camera';
// @ts-ignore
import ArrowRight from 'lucide-react-native/dist/cjs/icons/arrow-right';
// @ts-ignore
import Bell from 'lucide-react-native/dist/cjs/icons/bell';
// @ts-ignore
import Send from 'lucide-react-native/dist/cjs/icons/send';
// @ts-ignore
import MessageSquare from 'lucide-react-native/dist/cjs/icons/message-square';
// @ts-ignore
import ChevronLeft from 'lucide-react-native/dist/cjs/icons/chevron-left';
// @ts-ignore
import LayoutGrid from 'lucide-react-native/dist/cjs/icons/layout-grid';
// @ts-ignore
import Bone from 'lucide-react-native/dist/cjs/icons/bone';
// @ts-ignore
import Lightbulb from 'lucide-react-native/dist/cjs/icons/lightbulb';
// @ts-ignore
import Loader2 from 'lucide-react-native/dist/cjs/icons/loader-circle';
import Svg, { Path, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';

// Backend URL
const API_URL = 'https://long-eggs-camp.loca.lt/api/analyze';

// Renk Paleti
const colors = {
  primary: '#7C5135',      // Sıcak Sütlü Kahve
  primaryDark: '#543927',  // Derin Toprak Kahvesi
  accent: '#E8A398',       // Pati Pembesi
  accentSoft: '#F8C8C0',   // Soft Pembe
  bg: '#E5DED0',           // Arka Plan (Bej/Gri)
  cardBg: '#FAF7F2',       // Kart Arka Planı (Kemik Rengi)
  surface: '#FFFFFF',
  textMain: '#2D241E',     // Espresso Metin
  textMuted: '#8D8178',
};

const TRIVIA_DATA = [
  "Köpekler yaklaşık 250 kelimeyi ve el hareketini anlayabilme kapasitesine sahiptir.",
  "Kedilerin burun izleri, tıpkı insanların parmak izleri gibi her birey için eşsizdir.",
  "Bir köpeğin koku alma duyusu, insanlara kıyasla yaklaşık 100.000 kat daha güçlüdür.",
  "Kediler sadece insanlarla iletişim kurmak için miyavlarlar."
];

// Özel Pati İkonu (SVG)
const CustomPawIcon = ({ size = 24, color = "currentColor", style }: { size?: number, color?: string, style?: any }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={style}>
    <Path d="M12 21.5c-3 0-6-1.5-6-5 0-3 2-5 6-5s6 2 6 5c0 3.5-3 5-6 5z" />
    <Circle cx="7.5" cy="10.5" r="1.8" />
    <Circle cx="10" cy="8" r="2" />
    <Circle cx="14" cy="8" r="2" />
    <Circle cx="16.5" cy="10.5" r="1.8" />
  </Svg>
);

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [view, setView] = useState<'home' | 'chat' | 'nutrition' | 'analysis' | 'result'>('home');
  const [userInput, setUserInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: string, text: string }[]>([
    { role: 'assistant', text: 'Sistem aktif. Pawmate teknik destek birimine hoş geldiniz. Evcil hayvanınızın biyometrik verileri veya beslenme protokolleri hakkında bilgi talep edebilirsiniz.' }
  ]);
  const [aiResponse, setAiResponse] = useState<{ title: string, content: string } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);
  const [currentTrivia, setCurrentTrivia] = useState(0);

  // Trivia Döngüsü
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTrivia((prev) => (prev + 1) % TRIVIA_DATA.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Chat Scroll
  useEffect(() => {
    if (view === 'chat') {
      setTimeout(() => chatScrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatMessages, view]);

  // Görsel Seçme ve Analiz
  const handleImageAnalysis = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermelisiniz.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      setImagePreview(selectedImage);
      setView('analysis');
      performAnalysis(selectedImage); // Analizi başlat
    }
  };

  // Backend'e Analiz İsteği
  const performAnalysis = async (imageUri: string) => {
    setLoading(true);
    try {
      const data = new FormData();
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      // @ts-ignore
      data.append('file', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      const response = await axios.post(API_URL, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });

      setAiResponse({
        title: "Biyometrik Analiz Raporu",
        content: response.data.analysis
      });
      setView('result');

    } catch (error: any) {
      console.error(error);
      Alert.alert('Hata', 'Analiz sırasında bir sorun oluştu. Sunucu bağlantısını kontrol edin.');
      setView('home');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = () => {
    if (!userInput.trim()) return;
    const userMsg = { role: 'user', text: userInput };
    setChatMessages(prev => [...prev, userMsg]);
    setUserInput('');

    // Mock Response (Backend Chat API henüz yoksa)
    setTimeout(() => {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Şu anda chat sunucuları bakımda. Lütfen daha sonra tekrar deneyiniz." }]);
    }, 1000);
  };

  const handleNutritionChat = () => {
    // Nutrition için de şimdilik mock
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setAiResponse({ title: "Nutrisyonel Analiz", content: "Beslenme programı oluşturuldu:\n\n1. *Protein:* Yüksek kaliteli hayvansal protein.\n2. *Vitamin:* B12 ve D vitamini takviyesi önerilir.\n3. *Su:* Günlük su tüketimi artırılmalı." });
      setView('result');
    }, 2000);
  };


  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>

      {/* Arka Plan Desenleri */}
      <View style={styles.patternContainer}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[styles.patternIcon, { transform: [{ rotate: i % 2 === 0 ? '15deg' : '-15deg' }] }]}>
            <CustomPawIcon size={80} color={colors.accentSoft} style={{ opacity: 0.12 }} />
          </View>
        ))}
      </View>

      {/* Main Content Area (Kart Görünümü) */}
      <View style={styles.cardContainer}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {view !== 'home' && (
              <TouchableOpacity onPress={() => setView('home')} style={styles.backButton}>
                <ChevronLeft size={24} color="#666" />
              </TouchableOpacity>
            )}
            <View style={styles.logoBox}>
              <CustomPawIcon size={26} color="#fff" />
            </View>
            <View>
              <Text style={styles.logoSubtitle}>AI DIVISION</Text>
              <Text style={styles.logoTitle}>PAWMATE</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellButton}>
            <Bell size={22} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Dynamic Content */}
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>

          {/* HOME VIEW */}
          {view === 'home' && (
            <View style={styles.homeContent}>
              <Text style={styles.heroTitle}>Teknik {'\n'}<Text style={{ color: colors.primary }}>Analiz Paneli</Text></Text>

              {/* Kamera Kartı */}
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.cameraCard}
              >
                <View style={{ zIndex: 10 }}>
                  <Text style={styles.cardTitle}>Görsel Tarama</Text>
                  <Text style={styles.cardDesc}>Biyometrik veriler için tarayıcıyı aktif edin.</Text>
                  <TouchableOpacity style={styles.cameraButton} onPress={handleImageAnalysis}>
                    <Camera size={20} color="#333" />
                    <Text style={styles.cameraButtonText}>Tarayıcıyı Başlat</Text>
                  </TouchableOpacity>
                </View>
                {/* Dekoratif Büyük Pati */}
                <View style={styles.cameraDecor}>
                  <CustomPawIcon size={200} color="#fff" style={{ opacity: 0.1 }} />
                </View>
              </LinearGradient>

              {/* Nutrition Card */}
              <TouchableOpacity style={styles.nutritionCard} onPress={() => setView('nutrition')}>
                <View style={styles.nutritionLeft}>
                  <View style={styles.iconBox}>
                    <Bone size={28} color="#666" />
                  </View>
                  <View>
                    <Text style={styles.nutritionTitle}>Beslenme Analizi</Text>
                    <Text style={styles.nutritionSubtitle}>DIYET VE VITAMIN</Text>
                  </View>
                </View>
                <ArrowRight size={20} color="#ccc" />
              </TouchableOpacity>

              {/* Trivia Card */}
              <View style={styles.triviaCard}>
                <View style={styles.triviaHeader}>
                  <View style={styles.bulbIcon}>
                    <Lightbulb size={20} color="#FFC107" />
                  </View>
                  <Text style={styles.triviaLabel}>TEKNİK BİLGİ</Text>
                </View>
                <Text style={styles.triviaText}>"{TRIVIA_DATA[currentTrivia]}"</Text>

                <View style={styles.triviaDots}>
                  {TRIVIA_DATA.map((_, i) => (
                    <View key={i} style={[styles.dot, i === currentTrivia && styles.activeDot]} />
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* CHAT VIEW */}
          {view === 'chat' && (
            <View style={styles.chatContainer}>
              <ScrollView
                ref={chatScrollRef}
                style={styles.chatHistory}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {chatMessages.map((msg, idx) => (
                  <View key={idx} style={[
                    styles.chatBubbleWrapper,
                    msg.role === 'user' ? styles.chatEnd : styles.chatStart
                  ]}>
                    <View style={[
                      styles.chatBubble,
                      msg.role === 'user' ? styles.userBubble : styles.aiBubble
                    ]}>
                      <Text style={msg.role === 'user' ? styles.userText : styles.aiText}>{msg.text}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.chatInputWrapper}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="Destek talebinizi yazın..."
                  placeholderTextColor="#999"
                  value={userInput}
                  onChangeText={setUserInput}
                />
                <TouchableOpacity style={styles.sendButton} onPress={handleChat}>
                  <Send size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* NUTRITION INPUT VIEW */}
          {view === 'nutrition' && (
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Beslenme Analizi</Text>
              <Text style={styles.sectionValidation}>Evcil hayvanınız için teknik besin takviye rehberi oluşturmak üzere veri girişi yapınız.</Text>

              <TextInput
                style={styles.nutritionInput}
                multiline
                placeholder="Örn: 4 yaşında kedi için mineral gereksinimleri..."
                placeholderTextColor="#999"
                value={userInput}
                onChangeText={setUserInput}
              />

              <TouchableOpacity style={styles.actionButton} onPress={handleNutritionChat}>
                <Text style={styles.actionButtonText}>Raporu Derle</Text>
              </TouchableOpacity>
            </View>
          )}


          {/* ANALYSIS LOADER */}
          {view === 'analysis' && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#ccc" />
              <Text style={styles.loaderTitle}>Analiz Ediliyor</Text>
              <Text style={styles.loaderDesc}>Gelişmiş AI katmanları veriyi işliyor...</Text>
            </View>
          )}

          {/* ANALYSIS RESULT */}
          {view === 'result' && aiResponse && (
            <View style={styles.resultView}>
              <View style={styles.resultCard}>
                {imagePreview && (
                  <Image source={{ uri: imagePreview }} style={styles.resultImage} />
                )}
                <Text style={styles.resultTitle}>{aiResponse.title}</Text>
                <Markdown style={markdownStyles}>
                  {aiResponse.content}
                </Markdown>
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={() => { setView('home'); setImagePreview(null); }}>
                <Text style={styles.actionButtonText}>Geri Dön</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Bottom Nav */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setView('home')}>
            <LayoutGrid size={24} color={view === 'home' ? colors.textMain : '#ccc'} strokeWidth={view === 'home' ? 3 : 2} />
            <Text style={[styles.navText, view === 'home' && styles.navTextActive]}>Panel</Text>
          </TouchableOpacity>

          <View style={styles.navCameraWrapper}>
            <TouchableOpacity style={styles.navCameraBtn} onPress={handleImageAnalysis}>
              <Camera size={32} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.navItem} onPress={() => setView('chat')}>
            <MessageSquare size={24} color={view === 'chat' ? colors.textMain : '#ccc'} strokeWidth={view === 'chat' ? 3 : 2} />
            <Text style={[styles.navText, view === 'chat' && styles.navTextActive]}>Destek</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  patternContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 20,
    opacity: 0.5,
    zIndex: -1,
  },
  patternIcon: {
    width: 100,
    height: 100,
    margin: 20,
  },
  cardContainer: {
    flex: 1,
    backgroundColor: colors.cardBg,
    marginHorizontal: 10, // Kenarlardan boşluk verip kart hissi yaratmak için
    marginBottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingTop: 30,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  logoBox: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '3deg' }],
  },
  logoSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#aaa',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  logoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textMain,
    letterSpacing: -1,
  },
  bellButton: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  contentScroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#333',
    marginBottom: 30,
    lineHeight: 38,
  },
  homeContent: {
    paddingBottom: 24,
  },
  cameraCard: {
    borderRadius: 36,
    padding: 30,
    minHeight: 200,
    position: 'relative',
    marginBottom: 24,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
    maxWidth: 180,
    lineHeight: 20,
  },
  cameraButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
  },
  cameraButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  cameraDecor: {
    position: 'absolute',
    right: -40,
    bottom: -40,
    transform: [{ rotate: '-12deg' }],
  },
  nutritionCard: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  nutritionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nutritionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionSubtitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#aaa',
    letterSpacing: 2,
    marginTop: 4,
  },
  triviaCard: {
    backgroundColor: '#1c1917',
    borderRadius: 32,
    padding: 28,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 30,
  },
  triviaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  bulbIcon: {
    padding: 6,
    backgroundColor: 'rgba(255,193,7,0.1)',
    borderRadius: 8,
  },
  triviaLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#666',
    letterSpacing: 2,
  },
  triviaText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    lineHeight: 24,
    fontStyle: 'italic',
    minHeight: 70,
  },
  triviaDots: {
    position: 'absolute',
    top: 30,
    right: 30,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 6,
  },
  activeDot: {
    width: 20,
    backgroundColor: '#FFC107',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderTopWidth: 1,
    borderColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
    gap: 4,
  },
  navText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ccc',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  navTextActive: {
    color: colors.textMain,
  },
  navCameraWrapper: {
    marginTop: -40,
  },
  navCameraBtn: {
    width: 72,
    height: 72,
    backgroundColor: colors.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 6,
    borderColor: '#fff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  chatContainer: {
    height: Dimensions.get('window').height * 0.7,
  },
  chatHistory: {
    flex: 1,
  },
  chatBubbleWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chatStart: {
    justifyContent: 'flex-start',
  },
  chatEnd: {
    justifyContent: 'flex-end',
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#333',
    borderTopRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderTopLeftRadius: 4,
  },
  userText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  aiText: {
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
  },
  chatInputWrapper: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 20,
  },
  chatInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
  },
  sendButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionValidation: {
    fontSize: 14,
    color: '#888',
    marginBottom: 24,
    lineHeight: 20,
  },
  nutritionInput: {
    backgroundColor: '#fff',
    height: 200,
    borderRadius: 24,
    padding: 20,
    fontSize: 14,
    color: '#333',
    borderWidth: 1,
    borderColor: '#eee',
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#1c1917',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  loaderDesc: {
    color: '#999',
    marginTop: 8,
  },
  resultView: {
    paddingBottom: 40,
  },
  resultCard: {
    backgroundColor: '#fff',
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  resultImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
});

const markdownStyles = StyleSheet.create({
  body: {
    color: '#444',
    fontSize: 15,
    lineHeight: 24,
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 10,
    marginBottom: 8,
  },
  strong: {
    fontWeight: 'bold',
    color: '#222',
  }
});
