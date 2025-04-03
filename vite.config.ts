import preact from "@preact/preset-vite";
import path from "path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

// import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@lib": path.resolve(__dirname, "./src/lib"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@api": path.resolve(__dirname, "./src/api"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@styles": path.resolve(__dirname, "./src/styles"),
    },
  },
  plugins: [preact(), eslint()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const HugeLibraries = ["chart.js", "@mantine", "@supabase"];
          if (HugeLibraries.some((libName) => id.includes(`node_modules/${libName}`))) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        },
      },
    },
  },
});
