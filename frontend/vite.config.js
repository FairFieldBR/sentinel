import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.VERCEL ? '/' : process.env.NODE_ENV === 'production' ? '/sentinel-fairfield/' : '/',
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['jung', 'sentinel.40405050.xyz'],
    proxy: {
      '/api': 'http://localhost:3001',
      '/arquivos': 'http://localhost:3001'
    }
  }
})
