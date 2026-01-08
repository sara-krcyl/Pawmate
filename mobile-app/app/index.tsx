import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ChevronLeft,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { AuthService } from "../utils/auth";

export default function Index() {
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  // LOGIN
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // SIGNUP
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [gender, setGender] = useState<
    "Kadın" | "Erkek" | "Belirtmek İstemiyorum"
  >("Belirtmek İstemiyorum");

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Hata", "E-posta ve şifre giriniz.");
      return;
    }

    setLoading(true);
    const res = await AuthService.login(email, password);
    setLoading(false);

    if (res.success) {
      router.replace("/home");
    } else {
      Alert.alert("Giriş Başarısız", res.message);
    }
  };

  /* ---------------- SIGNUP ---------------- */
  const handleSignup = async () => {
    if (!firstName || !surname || !email || !password) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }

    setLoading(true);
    const res = await AuthService.register({
      firstName,
      surname,
      email,
      password,
      gender,
    });
    setLoading(false);

    if (res.success) {
      Alert.alert("Kayıt Başarılı", res.message);
      setMode("login");
      setFirstName("");
      setSurname("");
      setEmail("");
      setPassword("");
    } else {
      Alert.alert("Hata", res.message);
    }
  };

  const inputStyle = (name: string) => [
    styles.inputWrapper,
    focused === name && styles.inputFocused,
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: colors.bg }}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* LOGO */}
        <View style={styles.logoBox}>
          <Text style={styles.logo}>🐾</Text>
        </View>

        <Text style={styles.title}>PAWMATE</Text>
        <Text style={styles.subtitle}>
          {mode === "login"
            ? "Dostunuzun dünyasına giriş yapın"
            : "Pawmate ailesine katılın"}
        </Text>

        {/* FORM */}
        <View style={styles.card}>
          {mode === "signup" && (
            <>
              <View style={inputStyle("firstName")}>
                <User size={20} color={colors.primary} />
                <TextInput
                  placeholder="Ad"
                  placeholderTextColor="#8E8E8E"
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  onFocus={() => setFocused("firstName")}
                  onBlur={() => setFocused(null)}
                />
              </View>

              <View style={inputStyle("surname")}>
                <User size={20} color={colors.primary} />
                <TextInput
                  placeholder="Soyad"
                  placeholderTextColor="#8E8E8E"
                  style={styles.input}
                  value={surname}
                  onChangeText={setSurname}
                  onFocus={() => setFocused("surname")}
                  onBlur={() => setFocused(null)}
                />
              </View>
            </>
          )}

          <View style={inputStyle("email")}>
            <Mail size={20} color={colors.primary} />
            <TextInput
              placeholder="E-posta"
              placeholderTextColor="#8E8E8E"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
            />
          </View>

          <View style={inputStyle("password")}>
            <Lock size={20} color={colors.primary} />
            <TextInput
              placeholder="Şifre"
              placeholderTextColor="#8E8E8E"
              style={styles.input}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color={colors.primary} />
              ) : (
                <Eye size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.mainButton}
            onPress={mode === "login" ? handleLogin : handleSignup}
            disabled={loading}
          >
            <Text style={styles.mainButtonText}>
              {loading
                ? "İşlem Sürüyor..."
                : mode === "login"
                ? "GİRİŞ YAP"
                : "KAYIT OL"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setMode(mode === "login" ? "signup" : "login")}
          >
            <Text style={styles.switchText}>
              {mode === "login"
                ? "Hesabınız yok mu? Kayıt Ol"
                : "Zaten hesabınız var mı? Giriş Yap"}
            </Text>
          </TouchableOpacity>

          {mode === "signup" && (
            <TouchableOpacity
              onPress={() => setMode("login")}
              style={styles.backButton}
            >
              <ChevronLeft size={18} color={colors.textMuted} />
              <Text style={styles.backText}>Geri</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ---------------- THEME ---------------- */

const colors = {
  primary: "#7C5135",
  bg: "#FAF7F2",
  textMain: "#2D241E",
  textMuted: "#8D8178",
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  logoBox: {
    alignSelf: "center",
    backgroundColor: colors.primary,
    width: 80,
    height: 80,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  logo: {
    fontSize: 40,
    color: "white",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    textAlign: "center",
    color: colors.textMain,
  },
  subtitle: {
    textAlign: "center",
    color: colors.textMuted,
    marginBottom: 32,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 24,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2DDD8",
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textMain,
  },
  mainButton: {
    backgroundColor: "#1F1F1F",
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: "center",
    marginTop: 12,
  },
  mainButtonText: {
    color: "white",
    fontWeight: "800",
    letterSpacing: 1,
  },
  switchText: {
    marginTop: 20,
    textAlign: "center",
    fontWeight: "600",
    color: colors.textMuted,
    fontSize: 13,
  },
  backButton: {
    marginTop: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
});
