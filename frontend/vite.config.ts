import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

//default vite port is 5173, this sets it to listen at 8080 instead
export default defineConfig({
  plugins: [react()],
  server: {
	host: '0.0.0.0',
	port: 8080,
  },
})