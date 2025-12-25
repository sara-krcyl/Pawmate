import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Takvim Türkçe ayarları (Opsiyonel)
LocaleConfig.locales['tr'] = {
    monthNames: [
        'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
        'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ],
    monthNamesShort: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
    dayNames: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
    dayNamesShort: ['Paz', 'Pts', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
    today: "Bugün"
};
LocaleConfig.defaultLocale = 'tr';

export default function NotesScreen() {
    const [selectedDate, setSelectedDate] = useState('');
    const [note, setNote] = useState('');
    const [savedNotes, setSavedNotes] = useState<{ [key: string]: string }>({});

    const handleDayPress = (day: any) => {
        setSelectedDate(day.dateString);
        setNote(savedNotes[day.dateString] || '');
    };

    const saveNote = () => {
        if (!selectedDate) {
            Alert.alert('Uyarı', 'Lütfen önce takvimden bir gün seçin.');
            return;
        }
        setSavedNotes({ ...savedNotes, [selectedDate]: note });
        Alert.alert('Başarılı', 'Not kaydedildi!');
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Takvim ve Notlar</Text>

            <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                    [selectedDate]: { selected: true, disableTouchEvent: true, dotColor: 'orange' }
                }}
                theme={{
                    selectedDayBackgroundColor: '#6200ee',
                    arrowColor: '#6200ee',
                }}
                style={styles.calendar}
            />

            <View style={styles.noteSection}>
                <Text style={styles.label}>
                    {selectedDate ? `${selectedDate} Tarihli Notunuz:` : 'Bir tarih seçin'}
                </Text>
                <TextInput
                    style={styles.input}
                    multiline
                    placeholder="Buraya notunuzu yazın..."
                    value={note}
                    onChangeText={setNote}
                    editable={!!selectedDate}
                />
                <TouchableOpacity
                    style={[styles.saveButton, !selectedDate && styles.disabledButton]}
                    onPress={saveNote}
                    disabled={!selectedDate}
                >
                    <Text style={styles.saveButtonText}>Notu Kaydet</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        padding: 20,
        textAlign: 'center',
    },
    calendar: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    noteSection: {
        padding: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    input: {
        height: 150,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        textAlignVertical: 'top',
        backgroundColor: '#f9f9f9',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#6200ee',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20,
    },
    disabledButton: {
        backgroundColor: '#bbb',
    },
    saveButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
