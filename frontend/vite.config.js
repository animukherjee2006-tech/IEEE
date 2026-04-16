import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <--- Isse change karo

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
