import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Dev server — binds to all interfaces so localhost + network work
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
  },

  // Production build
  build: {
    outDir: 'dist',
    sourcemap: false
  },
})
