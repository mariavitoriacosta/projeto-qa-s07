import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import istanbul from 'vite-plugin-istanbul'

export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: ['src/**/*'],
      exclude: ['node_modules', '**/*.test.js'],
      extension: ['.js', '.jsx'],
      requireEnv: true,
      checkProd: true,
    }),
  ],
  build: {
    sourcemap: process.env.VITE_COVERAGE === 'true',
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3001',
      }
    }
  }
})
