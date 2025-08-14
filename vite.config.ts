import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  root: path.resolve(__dirname, "client"),
  build: { outDir: path.resolve(__dirname, "dist"), emptyOutDir: true },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@components": path.resolve(__dirname, "client/src/components"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
});
