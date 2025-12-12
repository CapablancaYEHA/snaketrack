import preact from "@preact/preset-vite";
import path from "path";
// import { visualizer } from "rollup-plugin-visualizer";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";
import pkg from "./package.json";

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
  plugins: [
    preact(),
    eslint(),
    // basicSsl({
    //   name: "test",
    //   domains: ["*.custom.com"],
    //   certDir: "/Users/.../.devServer/cert",
    // }),
    // visualizer({
    //   open: true, // Automatically opens the visualizer in your browser after build
    //   filename: "stats.html", // Output file name
    //   gzipSize: true, // Show sizes after gzip compression
    //   brotliSize: true, // Show sizes after brotli compression
    //   template: "treemap", // Can be 'treemap', 'list', 'sunburst', 'network', or 'raw-data' (JSON)
    // }),
  ],
  server: {
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const HugeLibraries = ["chart.js", "@mantine", "@supabase", "@tanstack", "browser-image-compression"];
          if (HugeLibraries.some((libName) => id.includes(`node_modules/${libName}`))) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        },
      },
    },
  },
});
