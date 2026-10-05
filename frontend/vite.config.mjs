import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const backend = process.env.VITE_API_PROXY_TARGET || "http://localhost:8080";

export default defineConfig({
  root: "frontend",
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/api": backend,
      "/socket.io": {
        target: backend,
        ws: true,
      },
      "/legacy.html": backend,
      "/styles.css": backend,
      "/api-client.js": backend,
      "/api-auth.js": backend,
      "/api-sync.js": backend,
      "/js": backend,
      "/assets": backend,
      "/finance-vitran.json": backend,
      "/manifest.webmanifest": backend,
      "/sw.js": backend,
      "/.well-known": backend,
    },
  },
});
