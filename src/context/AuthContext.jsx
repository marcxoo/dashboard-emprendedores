import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user_session');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.warn('Unable to access storage for session', e);
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
            try {
                localStorage.setItem('user_session', JSON.stringify(userData));
            } catch (e) {
                console.warn('Unable to save session', e);
            }
            return { success: true };
        } else {
            return { success: false, error: 'Credenciales incorrectas' };
        }
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem('user_session');
        } catch (e) { }
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
