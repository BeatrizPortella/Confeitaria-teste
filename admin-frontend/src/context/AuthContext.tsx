import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    user: any;
    login: (token: string) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            setUser({ token });
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('accessToken', token);
        setUser({ token });
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
