import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import Markdown from 'react-native-markdown-display';
import { useRouter } from 'expo-router';

// Backend IP Adresini buraya yazın
// Eğer Localtunnel URL'niz değiştiyse burayı güncellemeyi unutmayın!
const API_URL = 'https://long-eggs-camp.loca.lt/api/analyze';

// Tipler
interface FormData {
    image: string | null;
}

export default function AnalyzeScreen() {
    const [formData, setFormData] = useState<FormData>({ image: null });
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Debug için
    const [showDebug, setShowDebug] = useState(false);

    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('İzin Gerekli', 'Galeriye erişim izni vermelisiniz.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setFormData({ ...formData, image: result.assets[0].uri });
            setResult(null); // Yeni fotoğraf seçilince eski sonucu temizle
        }
    };

    const analyzeImage = async () => {
        if (!formData.image) {
            Alert.alert('Eksik Bilgi', 'Lütfen bir fotoğraf seçin.');
            return;
        }

        setLoading(true);
        setResult(null);

        const data = new FormData();

        // React Native için dosya formatı
        const uriParts = formData.image.split('.');
        const fileType = uriParts[uriParts.length - 1];

        // @ts-ignore: FormData append types are tricky in RN
        data.append('file', {
            uri: Platform.OS === 'ios' ? formData.image.replace('file://', '') : formData.image,
            name: `photo.${fileType}`,
            type: `image/${fileType}`,
        });

        try {
            console.log('Sending request to:', API_URL);
            const response = await axios.post(API_URL, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 100000,
            });

            console.log('Response:', response.data);
            setResult(response.data.analysis);

        } catch (error: any) {
            console.error('API Error:', error);
            let errorMessage = 'Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin.';

            if (error.response) {
                // Sunucu cevap verdi ama hata kodu ile
                errorMessage = `Sunucu Hatası (${error.response.status}): ${JSON.stringify(error.response.data)}`;
            } else if (error.request) {
                // İstek gitti ama cevap gelmedi
                errorMessage = 'Sunucu yanıt vermedi. Backend çalışıyor mu?';
            } else {
                errorMessage = error.message;
            }

            if (error.code === 'ECONNABORTED') {
                errorMessage = 'İstek zaman aşımına uğradı. Sunucu çok yavaş cevap veriyor.';
            }

            Alert.alert('Hata', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={{ height: 20 }} />

            {/* Debug Bilgisi (Geliştirme aşamasında açık kalsın) */}
            <TouchableOpacity onPress={() => setShowDebug(!showDebug)} style={styles.debugToggle}>
                <Text style={{ color: '#999', fontSize: 10 }}>
                    {showDebug ? 'Debug Gizle' : 'Debug Göster'}
                </Text>
            </TouchableOpacity>

            {showDebug && (
                <View style={styles.debugBox}>
                    <Text style={styles.debugText}>Sunucu Adresi: {API_URL}</Text>
                    <Text style={styles.debugText}>{loading ? 'Bağlantı Deneniyor...' : 'Hazır'}</Text>
                </View>
            )}

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                {formData.image ? (
                    <Image source={{ uri: formData.image }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Text style={styles.placeholderText}>Fotoğraf Seçmek İçin Dokun 📸</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={analyzeImage}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Analiz Et 🚀</Text>
                )}
            </TouchableOpacity>

            {result && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultTitle}>Analiz Sonucu:</Text>
                    <Markdown style={markdownStyles}>
                        {result}
                    </Markdown>
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#4A90E2', // Soluk mavi/kurumsal mavi
    },
    imagePicker: {
        height: 250,
        backgroundColor: '#fff',
        borderRadius: 15,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#fff',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        alignItems: 'center',
    },
    placeholderText: {
        color: '#666',
        fontSize: 16,
    },
    button: {
        backgroundColor: '#ff6b6b',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonDisabled: {
        backgroundColor: '#ffb3b3',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 15,
        marginBottom: 20,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    debugToggle: {
        alignSelf: 'center',
        marginBottom: 5,
    },
    debugBox: {
        backgroundColor: '#fff3cd',
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#ffeeba',
    },
    debugText: {
        fontSize: 10,
        color: '#856404',
        textAlign: 'center',
    },
});

const markdownStyles = StyleSheet.create({
    body: {
        color: '#333',
        fontSize: 16,
        lineHeight: 24,
    },
    heading1: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginTop: 10,
        marginBottom: 10,
    },
});
