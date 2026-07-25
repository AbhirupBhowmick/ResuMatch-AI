import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "https://resumatch-ai-74wq.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/oauth2": {
        target: process.env.VITE_API_URL || "https://resumatch-ai-74wq.onrender.com",
        changeOrigin: true,
        secure: false,
      },
      "/login/oauth2": {
        target: process.env.VITE_API_URL || "https://resumatch-ai-74wq.onrender.com",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
