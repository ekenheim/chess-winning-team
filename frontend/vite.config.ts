import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// `make app` (arena/app.py) serves the JSON API on :8000 and, once built, this bundle from frontend/dist.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Mirrors tsconfig.app.json `paths` so `@/lib/...` resolves in dev and build.
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: {
    port: 5173,
    proxy: { "/api": "http://127.0.0.1:8000" },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1600,
    // three + friends only load with the lazy Board3D chunk; the 2D bundle stays free of them.
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "three-vendor",
              test: /node_modules[\\/](three|@react-three|postprocessing|maath|three-stdlib|camera-controls|n8ao|troika[^\\/]*|meshline|stats-gl)[\\/]/,
            },
          ],
        },
      },
    },
  },
});
