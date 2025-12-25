import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Örnek Veri
const INITIAL_PETS = [
    { id: '1', name: 'Boncuk', type: 'Kedi', breed: 'Tekir', age: '2', image: null },
    { id: '2', name: 'Paşa', type: 'Köpek', breed: 'Golden Retriever', age: '3', image: null },
];

export default function PetsScreen() {
    const [pets, setPets] = useState(INITIAL_PETS);

    const renderPet = ({ item }: { item: typeof INITIAL_PETS[0] }) => (
        <View style={styles.card}>
            <View style={styles.petImage}>
                <Ionicons name={item.type === 'Kedi' ? 'logo-octocat' : 'paw'} size={40} color="#6200ee" />
            </View>
            <View style={styles.petInfo}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petDetails}>{item.breed}, {item.age} Yaşında</Text>
            </View>
            <TouchableOpacity style={styles.editButton}>
                <Ionicons name="create-outline" size={24} color="#666" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={pets}
                renderItem={renderPet}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
            />
            <TouchableOpacity style={styles.fab}>
                <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    list: {
        padding: 20,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    petImage: {
        width: 60,
        height: 60,
        backgroundColor: '#eee',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    petInfo: {
        flex: 1,
    },
    petName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    petDetails: {
        color: '#666',
        marginTop: 2,
    },
    editButton: {
        padding: 10,
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        backgroundColor: '#6200ee',
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});
