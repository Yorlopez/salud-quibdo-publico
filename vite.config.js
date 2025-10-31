import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        manual: resolve(__dirname, 'manual-usuario.html'), // Esta línea ya estaba, ¡genial!
        dashboardPaciente: resolve(__dirname, 'dashboard-paciente.html'),
        dashboardMedico: resolve(__dirname, 'dashboard-medico.html'),
        admin: resolve(__dirname, 'admin.html'),
        // Asegúrate de que el archivo 'index2.html' exista o elimínalo de aquí si no lo usas.
        solicitarConsulta: resolve(__dirname, 'index2.html'),
      },
    },
  },
});