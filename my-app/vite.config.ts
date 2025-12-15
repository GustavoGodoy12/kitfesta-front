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
        target: 'http://localhost:3022',
        changeOrigin: true,
        secure: false,
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
})
