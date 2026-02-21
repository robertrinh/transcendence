
import type { Config } from 'tailwindcss'

export default {
  content: [
    'index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
        colors: {
            brand: {
                cyan: '#00FFFF',
                orange: '#FF6600',
                magenta: '#FF00FF',
                acidGreen: '#00FF80',
                yellow: '#FFFF00',
                purple: '#9D00FF',
                hotPink: '#FF1493',
                mint: '#00FFCC',
                red: '#FF0040',
            },
        },
        fontFamily: {
            montserrat: ['Montserrat', 'sans-serif'],
        },
        animation: {
            'fade-in': 'fadeIn 0.3s ease-in-out', // for profile popup
            'marquee-left': 'marquee-left var(--duration, 25s) linear infinite',
            'marquee-right': 'marquee-right var(--duration, 25s) linear infinite',
        },
        keyframes: {
            fadeIn: {
                '0%': { opacity: '0', transform: 'translate(-50%, -10px)' },
                '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
            },
            'marquee-left': {
                '0%': { transform: 'translateX(0%)' },
                '100%': { transform: 'translateX(-50%)' },
            },
            'marquee-right': {
                '0%': { transform: 'translateX(-50%)' },
                '100%': { transform: 'translateX(0%)' },
            },
            'gradient-shift': {
                '0%, 100%': { backgroundPosition: '0% 50%' },
                '50%': { backgroundPosition: '100% 50%' },
            },
        },
    },
  },
  plugins: [],
} satisfies Config