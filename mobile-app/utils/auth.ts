import AsyncStorage from '@react-native-async-storage/async-storage';

const USERS_KEY = 'pawmate_users';

export interface User {
    email: string;
    password: string; // Gerçek uygulamalarda şifre hashlenmeli! Demo için düz metin.
    firstName: string;
    surname: string;
    gender: string;
}

export const AuthService = {
    // Tüm kullanıcıları getir (Private helper)
    async getUsers(): Promise<User[]> {
        const usersJson = await AsyncStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    },

    // Kullanıcı Kaydı
    async register(user: User): Promise<{ success: boolean; message: string }> {
        try {
            const users = await this.getUsers();

            // E-posta kontrolü
            if (users.some(u => u.email === user.email)) {
                return { success: false, message: 'Bu e-posta adresi ile zaten kayıt olunmuş.' };
            }

            // Yeni kullanıcıyı ekle
            users.push(user);
            await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
            return { success: true, message: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' };
        } catch (error) {
            console.error('Kayıt hatası:', error);
            return { success: false, message: 'Kayıt sırasında bir hata oluştu.' };
        }
    },

    // Kullanıcı Girişi
    async login(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
        try {
            const users = await this.getUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                return { success: true, message: 'Giriş başarılı!', user };
            } else {
                // Güvenlik için detay vermemek daha iyidir ama kullanıcı deneyimi için ayrıştırıyoruz
                const emailExists = users.some(u => u.email === email);
                if (emailExists) {
                    return { success: false, message: 'Hatalı şifre.' };
                } else {
                    return { success: false, message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' };
                }
            }
        } catch (error) {
            console.error('Giriş hatası:', error);
            return { success: false, message: 'Giriş sırasında bir hata oluştu.' };
        }
    },

    // Şifre Sıfırlama
    async resetPassword(email: string): Promise<{ success: boolean; message: string }> {
        try {
            const users = await this.getUsers();
            const user = users.find(u => u.email === email);

            if (user) {
                return { success: true, message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi! (Demo)' };
            } else {
                return { success: false, message: 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.' };
            }
        } catch (error) {
            return { success: false, message: 'İşlem sırasında bir hata oluştu.' };
        }
    }
};
