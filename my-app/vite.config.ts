import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // << importante

  server: {
    proxy: {
      // Front chama /api/pedidos
      // Vite encaminha para http://localhost:3022/pedidos
      '/api': {
        target: 'http://52.201.240.172:3022/api',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
