import {defineStore} from 'pinia';
import {auth} from '@/firebase';
import {signInWithEmailAndPassword, signOut, onAuthStateChanged} from 'firebase/auth';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        initialized: false,
    }),
    actions: {
        async login(email, password) {
            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                this.user = userCredential.user;
            } catch (error) {
                console.error('Login error:', error);
                throw error;
            }
        },
        async logout() {
            try {
                await signOut(auth);
                this.user = null;
            } catch (error) {
                console.error('Logout error:', error);
                throw error;
            }
        },
        setUser(user) {
            this.user = user;
        },
        async initializeAuth() {
            return new Promise((resolve) => {
                onAuthStateChanged(auth, (user) => {
                    if (user) {
                        this.setUser(user);
                    } else {
                        this.setUser(null);
                    }
                    this.initialized = true;
                    resolve(user);
                });
            });
        }
    },
});
