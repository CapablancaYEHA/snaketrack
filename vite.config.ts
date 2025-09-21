import preact from "@preact/preset-vite";
import path from "path";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";
import pkg from "./package.json";

// const assets = ["placeholder.png", "fav.png"];

export default defineConfig({
  define: {
    "import.meta.env.VITE_APP_VERSION": JSON.stringify(pkg.version),
  },
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
  server: {
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const HugeLibraries = ["chart.js", "@mantine", "@supabase"];
          if (HugeLibraries.some((libName) => id.includes(`node_modules/${libName}`))) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        },
        // entryFileNames: `[name].[hash].js`,
        // chunkFileNames: `[name].[hash].js`,
        // assetFileNames: function (file) {
        //   return assets.includes(file.name) ? `assets/[name][extname]` : `assets/[name]-[hash].[ext]`;
        // },
      },
    },
  },
});
