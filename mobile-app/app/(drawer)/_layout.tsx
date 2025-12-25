import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function DrawerLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: true,
                drawerActiveTintColor: '#6200ee',
                drawerLabelStyle: { marginLeft: -20 },
            }}
        >
            <Drawer.Screen
                name="home"
                options={{
                    drawerLabel: 'Ana Sayfa',
                    title: 'Pawmates',
                    drawerIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="home-outline" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="analyze"
                options={{
                    drawerLabel: 'Analiz Et',
                    title: 'Pet Analizi',
                    drawerIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="scan-outline" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="profile"
                options={{
                    drawerLabel: 'Profil',
                    title: 'Profilim',
                    drawerIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="person-circle-outline" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="pets"
                options={{
                    drawerLabel: 'Hayvanlarım',
                    title: 'Tüm Dostlarım',
                    drawerIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="paw-outline" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="form"
                options={{
                    drawerLabel: 'Form',
                    title: 'Form',
                    drawerIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="document-text-outline" size={size} color={color} />,
                }}
            />
            <Drawer.Screen
                name="notes"
                options={{
                    drawerLabel: 'Notlar',
                    title: 'Takvim',
                    drawerIcon: ({ color, size }: { color: string; size: number }) => <Ionicons name="calendar-outline" size={size} color={color} />,
                }}
            />
        </Drawer>
    );
}
