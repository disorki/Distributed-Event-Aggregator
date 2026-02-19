/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'Montserrat', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                // Professional / Academic Palette
                brand: {
                    primary: '#A12027',    // Burgundy (Official-like)
                    secondary: '#003E7E',  // Navy Blue (Academic)
                    accent: '#E31E24',     // Bright Red Accents
                    neutral: '#545454',    // Dark Gray Text
                },
                bg: {
                    page: '#F5F5F7',       // Very light gray background
                    surface: '#FFFFFF',    // Pure white cards
                    header: '#FFFFFF',
                },
                text: {
                    main: '#333333',       // Almost Black
                    muted: '#666666',      // Medium Gray
                    light: '#FFFFFF',
                },
                status: {
                    success: '#10b981',
                    error: '#ef4444',
                    warning: '#f59e0b',
                }
            },
            boxShadow: {
                'card': '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
                'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out forwards',
                'fade-in-up': 'fadeInUp 0.5s ease-out forwards',
                'slide-up': 'slideUp 0.3s ease-out forwards',
                'pulse-slow': 'pulseSlow 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
                pulseSlow: {
                    '0%, 100%': { opacity: '0.4' },
                    '50%': { opacity: '1' },
                },
            }
        },
    },
    plugins: [],
}
