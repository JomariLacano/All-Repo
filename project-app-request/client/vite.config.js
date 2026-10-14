import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
    },
    preview: {
        allowedHosts: ['project-request-app-jomarilacano-ecckckfdbqaacrhe.southeastasia-01.azurewebsites.net'],
    },
});
