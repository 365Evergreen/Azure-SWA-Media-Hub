import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  server: {
    proxy: {
      // Proxy API calls to Azure Functions during local development
      '/api': {
        target: 'http://localhost:7071',
        changeOrigin: true,
      },
      // Proxy auth calls to a local SWA CLI emulator during development
      '/.auth': {
        target: 'http://localhost:4280',
        changeOrigin: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
  },
})
