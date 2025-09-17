import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"
import path from "path"

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173, // optional: ensures consistency locally
    open: true,
  },
  build: {
    outDir: "dist", // Cloudflare expects dist
  },
})
