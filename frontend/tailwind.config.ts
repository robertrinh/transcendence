
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
	},
  },
  plugins: [],
} satisfies Config