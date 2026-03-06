import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      // Proxy all /posters/* requests to Laravel backend
      "/posters": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      // Proxy all /api/* requests to Laravel backend
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
})

