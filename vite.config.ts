import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(fileURLToPath(new URL(".", import.meta.url)), "client", "src"),
      "@shared": path.resolve(fileURLToPath(new URL(".", import.meta.url)), "shared"),
    },
  },
  envDir: fileURLToPath(new URL(".", import.meta.url)),
  root: path.resolve(fileURLToPath(new URL(".", import.meta.url)), "client"),
  publicDir: path.resolve(fileURLToPath(new URL(".", import.meta.url)), "client", "public"),
  build: {
    outDir: path.resolve(fileURLToPath(new URL(".", import.meta.url)), "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "wouter"],
          ui: ["@radix-ui/react-dialog"],
          editor: ["@monaco-editor/react"],
        },
      },
    },
  },
  server: {
    host: true,
    port: 3000,
    fs: {
      strict: true,
      deny: ["/.env", "/.env.*"],
    },
  },
  preview: {
    port: 3000,
  },
});
