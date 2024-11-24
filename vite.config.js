import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, './env');
    return {
        plugins: [react()],
        envDir: './env',
        server: {
            proxy: {
                "/api": {
                    target: env.VITE_REACT_APP_BASE_URL,
                    changeOrigin: true,
                    headers: true,
                    rewrite: (path) => path.replace(/^\/api/, "/api/v1")
                },
            },
        },
    };
});
