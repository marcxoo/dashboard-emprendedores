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
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#ff7900',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                secondary: {
                    DEFAULT: '#0b2e43',
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0b2e43', // Main dark blue
                    950: '#082f49',
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
