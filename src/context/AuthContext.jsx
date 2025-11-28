import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for stored user on mount
        const storedUser = localStorage.getItem('user_session');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse user session", e);
                localStorage.removeItem('user_session');
            }
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock authentication
        if (email === 'admin@emprende.com' && password === 'admin123') {
            const userData = {
                id: 1,
                name: 'Admin User',
                email: email,
                role: 'admin'
            };
            setUser(userData);
            localStorage.setItem('user_session', JSON.stringify(userData));
            return { success: true };
        } else {
            return { success: false, error: 'Credenciales incorrectas' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_session');
    };

    const value = {
        user,
        login,
        logout,
        isAuthenticated: !!user,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
