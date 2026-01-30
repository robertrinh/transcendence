
import type { Config } from 'tailwindcss'

export default {
  content: [
    'index.html',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
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
        },
    },
  },
  plugins: [],
} satisfies Config