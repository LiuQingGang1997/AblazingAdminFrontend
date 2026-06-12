import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
       target: 'http://101.132.118.49:8080',
      //   target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
