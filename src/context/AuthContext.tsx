import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '@/api/client';
import { toast } from '@/hooks/use-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user is logged in (verify cookie)
    useEffect(() => {
        const checkUser = async () => {
            try {
                const { data } = await api.get('/auth/me');
                setUser(data);
            } catch (error) {
                // Not logged in
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkUser();

        // Multi-tab logout sync: Listen for changes in localStorage
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'vruksha_logout_event') {
                console.log('🔄 Multi-tab logout detected. Clearing session...');
                setUser(null);
                // Redirect if currently on a protected route
                if (window.location.pathname.startsWith('/admin')) {
                    window.location.href = '/admin/login';
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const login = async (formData: any) => {
        try {
            const { data } = await api.post('/auth/login', formData);
            setUser(data);
            toast({ title: 'Welcome back!', description: `Logged in as ${data.name}` });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: error.response?.data?.message || 'Something went wrong',
            });
            throw error;
        }
    };

    const register = async (formData: any) => {
        try {
            const { data } = await api.post('/auth/register', formData);
            setUser(data);
            toast({ title: 'Welcome!', description: 'Account created successfully' });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Registration Failed',
                description: error.response?.data?.message || 'Something went wrong',
            });
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
            setUser(null);
            // Trigger storage event for other tabs
            localStorage.setItem('vruksha_logout_event', Date.now().toString());
            toast({ title: 'Logged Out', description: 'See you soon!' });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
