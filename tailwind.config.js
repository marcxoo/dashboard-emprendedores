/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',
                    600: '#2563eb',
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                // Semantic colors mapped to what was in index.css
                success: {
                    bg: '#dcfce7',
                    text: '#166534',
                },
                warning: {
                    bg: '#fef3c7',
                    text: '#b45309',
                },
                danger: {
                    bg: '#fee2e2',
                    text: '#991b1b',
                },
                info: {
                    bg: '#e0f2fe',
                    text: '#075985',
                },
            },
            borderRadius: {
                'sm': '0.375rem',
                'md': '0.5rem',
                'lg': '0.75rem',
                'xl': '1rem',
            },
            spacing: {
                'sidebar': '280px',
                'header': '64px',
            }
        },
    },
    plugins: [],
}
