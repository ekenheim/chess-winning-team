import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `make app` (arena/app.py) serves the JSON API on :8000 and, once built, this bundle from frontend/dist.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
  build: { outDir: "dist", emptyOutDir: true },
});
