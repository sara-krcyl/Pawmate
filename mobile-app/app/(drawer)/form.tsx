import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FormScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Form Sayfası</Text>
            <Text style={styles.subtext}>Buraya formlar veya analiz araçları eklenebilir.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    subtext: {
        marginTop: 10,
        color: '#666',
    },
});
