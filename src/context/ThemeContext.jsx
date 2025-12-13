import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const storedPrefs = window.localStorage.getItem('theme');
                if (typeof storedPrefs === 'string') {
                    return storedPrefs;
                }
            }
        } catch (e) {
            console.warn('LocalStorage access denied', e);
        }
        return 'dark'; // Defaulting to DARK as requested by user ("dejalo en modo oscuro")
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            window.localStorage.setItem('theme', theme);
        } catch (e) { }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
