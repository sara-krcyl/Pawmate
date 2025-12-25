import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Image,
    Alert,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Markdown from 'react-native-markdown-display';
import axios from 'axios';

// Backend IP Adresini buraya yazın
// Backend IP Adresini buraya yazın
const API_URL = 'https://long-eggs-camp.loca.lt/api/analyze';

// Tipler
interface FormData {
    ownerName: string;
    petName: string;
    living: string;
    experience: string;
    children: string;
}

interface AnalysisResult {
    breed: string;
    animalType: 'cat' | 'dog';
    confidence: number;
    advice: string;
}

interface OptionButtonProps {
    label: string;
    value: string;
    currentValue: string;
    onSelect: (value: string) => void;
}

export default function App() {
    const router = useRouter();
    const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
    const [formData, setFormData] = useState<FormData>({
        ownerName: '',
        petName: '',
        living: 'apartment',
        experience: 'beginner',
        children: 'no',
    });
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);

    // Görsel Seçme
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermelisiniz.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
            base64: true,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    // Input Değişimi
    const handleInputChange = (name: keyof FormData, value: string) => {
        setFormData({ ...formData, [name]: value });
    };

    // Analiz Et
    const analyzePet = async () => {
        if (!image || !image.base64) {
            Alert.alert('Uyarı', 'Lütfen önce bir fotoğraf seçin!');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const base64Img = `data:image/jpeg;base64,${image.base64}`;

            const payload = {
                image: base64Img,
                userData: formData,
            };

            const response = await axios.post(API_URL, payload, { timeout: 100000 });
            setResult(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Hata', 'Sunucuya bağlanılamadı. Backend terminalini kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    // Seçenek Butonları
    const OptionButton = ({ label, value, currentValue, onSelect }: OptionButtonProps) => (
        <TouchableOpacity
            style={[
                styles.optionButton,
                currentValue === value && styles.optionButtonSelected,
            ]}
            onPress={() => onSelect(value)}
        >
            <Text
                style={[
                    styles.optionText,
                    currentValue === value && styles.optionTextSelected,
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title}>🐾 Pawmates</Text>
                    <TouchableOpacity onPress={() => router.replace('/')} style={styles.logoutButton}>
                        <Text style={styles.logoutText}>Çıkış</Text>
                    </TouchableOpacity>
                </View>

                {/* BAĞLANTI DEBUG BİLGİSİ */}
                <View style={styles.debugContainer}>
                    <Text style={styles.debugText}>Sunucu Adresi: {API_URL}</Text>
                    <Text style={styles.debugText}>Bağlantı Deneniyor...</Text>
                </View>

                {/* Görsel Alanı */}
                <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
                    {image ? (
                        <Image source={{ uri: image.uri }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Text style={styles.placeholderText}>Fotoğraf Seçmek İçin Dokun 📸</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Form Alanı */}
                <View style={styles.formContainer}>
                    <Text style={styles.sectionTitle}>👤 Kullanıcı Bilgileri</Text>

                    <Text style={styles.label}>Adınız Soyadınız:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örn: Ayşe Yılmaz"
                        value={formData.ownerName}
                        onChangeText={(text) => handleInputChange('ownerName', text)}
                    />

                    <Text style={styles.label}>Evcil Hayvanın Adı:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örn: Pamuk"
                        value={formData.petName}
                        onChangeText={(text) => handleInputChange('petName', text)}
                    />

                    <View style={styles.row}>
                        <Text style={styles.label}>Yaşam Alanı:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <OptionButton
                                label="Apartman"
                                value="apartment"
                                currentValue={formData.living}
                                onSelect={(val) => handleInputChange('living', val)}
                            />
                            <OptionButton
                                label="Bahçeli"
                                value="garden"
                                currentValue={formData.living}
                                onSelect={(val) => handleInputChange('living', val)}
                            />
                            <OptionButton
                                label="Çiftlik"
                                value="farm"
                                currentValue={formData.living}
                                onSelect={(val) => handleInputChange('living', val)}
                            />
                        </ScrollView>
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Çocuk:</Text>
                        <OptionButton
                            label="Yok"
                            value="no"
                            currentValue={formData.children}
                            onSelect={(val) => handleInputChange('children', val)}
                        />
                        <OptionButton
                            label="Var"
                            value="yes"
                            currentValue={formData.children}
                            onSelect={(val) => handleInputChange('children', val)}
                        />
                    </View>

                    <View style={styles.row}>
                        <Text style={styles.label}>Deneyim:</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <OptionButton
                                label="İlk Kez"
                                value="beginner"
                                currentValue={formData.experience}
                                onSelect={(val) => handleInputChange('experience', val)}
                            />
                            <OptionButton
                                label="Deneyimli"
                                value="experienced"
                                currentValue={formData.experience}
                                onSelect={(val) => handleInputChange('experience', val)}
                            />
                        </ScrollView>
                    </View>
                </View>

                {/* Buton */}
                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={analyzePet}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>🔍 ANALİZ ET</Text>
                    )}
                </TouchableOpacity>

                {/* Sonuç Alanı */}
                {result && (
                    <View style={styles.resultContainer}>
                        <View style={styles.resultHeader}>
                            <Text style={styles.resultTitle}>
                                {result.breed} {result.animalType === 'cat' ? '🐱' : '🐶'}
                            </Text>
                            <View style={styles.confidenceBadge}>
                                <Text style={styles.confidenceText}>
                                    Güven Skoru: %{Math.round(result.confidence * 100)}
                                </Text>
                            </View>
                        </View>

                        <Markdown style={markdownStyles}>
                            {result.advice}
                        </Markdown>
                    </View>
                )}
                <View style={{ height: 40 }} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    contentContainer: {
        padding: 20,
        paddingTop: 60,
    },
    // DEBUG KUTUSU
    debugContainer: {
        backgroundColor: '#fff3cd',
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ffeeba',
    },
    debugText: {
        color: '#856404',
        fontSize: 12,
        textAlign: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2E7D32',
    },
    logoutButton: {
        backgroundColor: '#ffebee',
        padding: 8,
        borderRadius: 8,
    },
    logoutText: {
        color: '#c62828',
        fontWeight: 'bold',
        fontSize: 14,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 15,
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        width: '100%',
        height: 200,
        backgroundColor: '#fff',
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#a5d6a7',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#666',
        fontSize: 16,
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#388e3c',
        marginBottom: 15,
    },
    input: {
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 12,
        fontSize: 16,
    },
    row: {
        marginBottom: 12,
    },
    label: {
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
        fontWeight: '600',
    },
    optionButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
        marginBottom: 8,
    },
    optionButtonSelected: {
        backgroundColor: '#e8f5e9',
        borderWidth: 1,
        borderColor: '#2E7D32',
    },
    optionText: {
        color: '#333',
    },
    optionTextSelected: {
        color: '#2E7D32',
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#2E7D32',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#90a4ae',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultContainer: {
        marginTop: 30,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    resultHeader: {
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#4CAF50',
        paddingBottom: 15,
        marginBottom: 15,
    },
    resultTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1B5E20',
        marginBottom: 8,
    },
    confidenceBadge: {
        backgroundColor: '#e8f5e9',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    confidenceText: {
        color: '#2e7d32',
        fontWeight: 'bold',
    },
});

const markdownStyles = StyleSheet.create({
    body: {
        color: '#333',
        fontSize: 16,
        lineHeight: 24,
    },
    heading1: {
        color: '#2E7D32',
        marginVertical: 10,
    },
    heading2: {
        color: '#388e3c',
        marginVertical: 8,
    },
    strong: {
        fontWeight: 'bold',
        color: '#1B5E20',
    },
});
