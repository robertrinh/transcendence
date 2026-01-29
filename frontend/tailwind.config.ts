
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
        },
        keyframes: {
            fadeIn: {
                '0%': { opacity: '0', transform: 'translate(-50%, -10px)' },
                '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
            },
        },
    },
  },
  plugins: [],
} satisfies Config