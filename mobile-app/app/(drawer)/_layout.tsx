import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';

export default function DrawerLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                swipeEnabled: false,
                drawerActiveTintColor: '#6200ee',
                drawerLabelStyle: { marginLeft: -20 },
            }}
        >
            <Drawer.Screen
                name="home"
                options={{
                    drawerLabel: 'Ana Sayfa',
                    title: 'Pawmates',
                }}
            />
            {/* Diğer ekranlar tanımlı kalsa da erişim home.tsx üzerinden olacak */}
            <Drawer.Screen name="analyze" options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="profile" options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="pets" options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="form" options={{ drawerItemStyle: { display: 'none' } }} />
            <Drawer.Screen name="notes" options={{ drawerItemStyle: { display: 'none' } }} />
        </Drawer>
    );
}
