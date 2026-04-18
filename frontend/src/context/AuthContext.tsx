import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => void;
    loading: boolean;
}

interface User {
    email: string;
    mobile: string;
    name: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in (check localStorage for persistent login)
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('authToken');

        // Also check sessionStorage for temporary login
        const sessionUser = sessionStorage.getItem('user');
        const sessionToken = sessionStorage.getItem('authToken');

        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        } else if (sessionUser && sessionToken) {
            setUser(JSON.parse(sessionUser));
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string, rememberMe: boolean = false) => {
        // For now, simple authentication without backend
        // In production, this should call your backend API

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        // Simple validation - accept any email/password for now
        if (email && password) {
            const userData: User = {
                email,
                mobile: '', // Will be populated from backend
                name: email.split('@')[0]
            };

            setUser(userData);
            setIsAuthenticated(true);

            if (rememberMe) {
                // Persistent login
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('authToken', 'demo-token');
            } else {
                // Session-only login
                sessionStorage.setItem('user', JSON.stringify(userData));
                sessionStorage.setItem('authToken', 'demo-token');
            }
        } else {
            throw new Error('Invalid credentials');
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('authToken');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading }}>
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
