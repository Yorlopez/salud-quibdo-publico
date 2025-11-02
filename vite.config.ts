import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        consulta: resolve(__dirname, 'index2.html'),
        // Añadido para asegurar que la página del manual se incluya en la compilación.
        manual: resolve(__dirname, 'manual-usuario.html'),
        dashboard_paciente: resolve(__dirname, 'dashboard-paciente.html'),
        dashboard_medico: resolve(__dirname, 'dashboard-medico.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true
  }
})