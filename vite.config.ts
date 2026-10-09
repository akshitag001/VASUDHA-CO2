import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // MapLibre GL is ~950 kB but is lazy-loaded only on the Neighbouring
    // Panchayats page, so it never affects first load.
    chunkSizeWarningLimit: 1000,
  },
})
