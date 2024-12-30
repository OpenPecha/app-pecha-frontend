import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "./env");
  return {
    plugins: [react()],
    envDir: "./env",
    server: {
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_BASE_URL,
          changeOrigin: true,
          secure: true
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test-utils/CommonMocks.js",
      coverage: {
        reporter: ["text", "html"],
        reportsDirectory: "./coverage",
      },
    },
  };
});
