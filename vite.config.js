import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Tidak perlu import tailwindcss lagi di sini untuk v3
// import tailwindcss from '@tailwindcss/vite' // Hapus baris ini jika ada

export default defineConfig({
  plugins: [
    react(),
    // Tidak perlu tailwindcss() di sini untuk v3
  ],
})