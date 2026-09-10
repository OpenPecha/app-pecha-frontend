import { defineConfig, loadEnv } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "./env");
  // One proxy definition, shared by `vite dev` and `vite preview`, so a built
  // bundle behaves the same as the dev server. In production nginx does this.
  const proxy = {
    "/api": {
      target: env.VITE_BACKEND_BASE_URL,
      changeOrigin: true,
      secure: true,
    },
    // Keeps the library API behind our own origin, so its host never appears in
    // a browser request and the X-Application header is added server-side
    // rather than shipped in the bundle.
    "/library": {
      target: env.VITE_LIBRARY_BASE_URL,
      changeOrigin: true,
      secure: true,
      rewrite: (path: string) => path.replace(/^\/library/, ""),
      headers: {
        "X-Application": env.VITE_LIBRARY_APP_NAME || "webuddhist",
      },
    },
    "/chats": {
      target: env.VITE_CHAT_API_URL,
      changeOrigin: true,
      secure: true,
      rewrite: (path: string) => path,
    },
    "/threads": {
      target: env.VITE_CHAT_API_URL,
      changeOrigin: true,
      secure: true,
    },
  };

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    envDir: "./env",
    server: {
      host: true,
      port: 3000,
      open: true,
      proxy,
    },
    preview: {
      port: 4173,
      proxy,
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: "./src/test-utils/CommonMocks.ts",
      coverage: {
        provider: "istanbul",
        reporter: ["text", "json", "html", "lcov"],
        reportsDirectory: "./coverage",
        exclude: [
          "**/*.ts",
          "**/*test.tsx",
          "src/config/**",
          "src/main.tsx",
          "src/App.tsx",
          "src/context/**",
          "src/utils/**",
          "dist/**",
          "src/layouts",
          "src/components/**",
          "src/routes/chat/components/atom/**",
          "src/routes/chat/context/**",
          "src/routes/chat/hooks/**",
          "src/routes/chat/ChatLayout.tsx",
          "src/routes/chat/ChatThread.tsx",
        ],
      },
    },
  };
});
