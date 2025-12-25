import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Modal,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthService } from '../utils/auth';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Modal durumları
    const [forgotModalVisible, setForgotModalVisible] = useState(false);
    const [signupModalVisible, setSignupModalVisible] = useState(false);
    const [gender, setGender] = useState('Kadın');

    // Kayıt Formu State'leri
    const [signupFirstName, setSignupFirstName] = useState('');
    const [signupSurname, setSignupSurname] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');

    // Şifremi Unuttum State
    const [forgotEmail, setForgotEmail] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen e-posta ve şifrenizi girin.');
            return;
        }

        if (!isValidEmail(email)) {
            Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi girin.');
            return;
        }

        setLoading(true);
        // Gerçek giriş işlemi
        try {
            const result = await AuthService.login(email, password);
            setLoading(false);

            if (result.success) {
                // Başarılı giriş sonrası Home sayfasına yönlendir
                router.replace('/home');
            } else {
                Alert.alert('Giriş Başarısız', result.message);
            }
        } catch (error) {
            setLoading(false);
            Alert.alert('Hata', 'Bir hata oluştu.');
        }
    };

    const handleForgotPassword = async () => {
        if (!forgotEmail) {
            Alert.alert('Hata', 'Lütfen e-posta adresinizi girin.');
            return;
        }
        if (!isValidEmail(forgotEmail)) {
            Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi girin.');
            return;
        }

        const result = await AuthService.resetPassword(forgotEmail);

        if (result.success) {
            Alert.alert("Şifre Sıfırlama", result.message);
            setForgotModalVisible(false);
            setForgotEmail('');
        } else {
            Alert.alert("Hata", result.message);
        }
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPassword = (password: string) => {
        if (password.length < 6) return false;
        if (!/\d/.test(password)) return false;
        return true;
    };

    const handleSignup = async () => {
        if (!signupFirstName || !signupSurname || !signupEmail || !signupPassword) {
            Alert.alert('Eksik Bilgi', 'Lütfen tüm alanları doldurun.');
            return;
        }

        if (!isValidEmail(signupEmail)) {
            Alert.alert('Geçersiz E-posta', 'Lütfen geçerli bir e-posta adresi girin (örn: isim@site.com).');
            return;
        }

        if (!isValidPassword(signupPassword)) {
            Alert.alert('Zayıf Şifre', 'Şifreniz en az 6 karakter olmalı ve en az 1 rakam içermelidir.');
            return;
        }

        const newUser = {
            firstName: signupFirstName,
            surname: signupSurname,
            email: signupEmail,
            password: signupPassword,
            gender: gender
        };

        const result = await AuthService.register(newUser);

        if (result.success) {
            Alert.alert("Kayıt Başarılı", result.message);
            setSignupModalVisible(false);
            // Formu temizle
            setSignupFirstName('');
            setSignupSurname('');
            setSignupEmail('');
            setSignupPassword('');
            setGender('Kadın');
        } else {
            Alert.alert("Kayıt Başarısız", result.message);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="dark" />

            <View style={styles.headerContainer}>
                <Text style={styles.appName}>🐾 Pawmate</Text>
                <Text style={styles.tagline}>Dostlarınızı daha iyi tanıyın</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
                <Text style={styles.subText}>Devam etmek için giriş yapın</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>E-Posta</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ornek@email.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Şifre</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="******"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity style={styles.forgotButton} onPress={() => setForgotModalVisible(true)}>
                    <Text style={styles.forgotText}>Şifremi Unuttum?</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginButtonText}>
                        {loading ? 'Giriş Yapılıyor...' : 'GİRİŞ YAP'}
                    </Text>
                </TouchableOpacity>

                <View style={styles.signupContainer}>
                    <Text style={styles.signupText}>Hesabınız yok mu? </Text>
                    <TouchableOpacity onPress={() => setSignupModalVisible(true)}>
                        <Text style={styles.signupLink}>Kayıt Ol</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Şifremi Unuttum Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={forgotModalVisible}
                onRequestClose={() => setForgotModalVisible(false)}
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Şifremi Unuttum</Text>
                        <Text style={styles.modalText}>E-posta adresinizi girin, size sıfırlama linki gönderelim.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="E-posta"
                            value={forgotEmail}
                            onChangeText={setForgotEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={styles.loginButton} onPress={handleForgotPassword}>
                            <Text style={styles.loginButtonText}>GÖNDER</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setForgotModalVisible(false)}>
                            <Text style={styles.cancelText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Kayıt Ol Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={signupModalVisible}
                onRequestClose={() => setSignupModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.modalView}
                >
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>Kayıt Ol</Text>
                            <Text style={styles.subText}>Aramıza katılmak için formu doldurun</Text>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.inputLabel}>Ad</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Ali"
                                        value={signupFirstName}
                                        onChangeText={setSignupFirstName}
                                    />
                                </View>
                                <View style={[styles.inputContainer, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Soyad</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Örn: Yılmaz"
                                        value={signupSurname}
                                        onChangeText={setSignupSurname}
                                    />
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Cinsiyet</Text>
                                <View style={styles.genderContainer}>
                                    {['Kadın', 'Erkek', 'Belirtmek İstemiyorum'].map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            style={[
                                                styles.genderButton,
                                                gender === item && styles.genderButtonSelected
                                            ]}
                                            onPress={() => setGender(item)}
                                        >
                                            <Text style={[
                                                styles.genderText,
                                                gender === item && styles.genderTextSelected
                                            ]}>
                                                {item}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>E-Posta</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="ornek@email.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={signupEmail}
                                    onChangeText={setSignupEmail}
                                />
                            </View>

                            <View style={styles.inputContainer}>
                                <Text style={styles.inputLabel}>Şifre</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="******"
                                    secureTextEntry
                                    value={signupPassword}
                                    onChangeText={setSignupPassword}
                                />
                            </View>

                            <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
                                <Text style={styles.loginButtonText}>KAYIT OL</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => setSignupModalVisible(false)} style={{ padding: 10, alignSelf: 'center' }}>
                                <Text style={styles.cancelText}>İptal</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#e8f5e9',
        justifyContent: 'center',
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginBottom: 5,
    },
    tagline: {
        fontSize: 16,
        color: '#388e3c',
        opacity: 0.8,
    },
    formContainer: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        padding: 30,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1B5E20',
        textAlign: 'center',
        marginBottom: 5,
    },
    subText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 8,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
        width: '100%'
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginBottom: 30,
    },
    forgotText: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: '600',
    },
    loginButton: {
        backgroundColor: '#2E7D32',
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#2E7D32',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        width: '100%'
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    signupText: {
        color: '#666',
        fontSize: 14,
    },
    signupLink: {
        color: '#2E7D32',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#2E7D32'
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        color: '#666'
    },
    cancelText: {
        color: '#999',
        marginTop: 10,
        fontWeight: '600'
    },
    genderContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10
    },
    genderButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        borderWidth: 1,
        borderColor: 'transparent'
    },
    genderButtonSelected: {
        backgroundColor: '#e8f5e9',
        borderColor: '#2E7D32'
    },
    genderText: {
        color: '#666',
        fontSize: 13
    },
    genderTextSelected: {
        color: '#2E7D32',
        fontWeight: 'bold'
    }
});
