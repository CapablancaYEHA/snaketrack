import preact from "@preact/preset-vite";
import { defineConfig } from "vite";
import eslint from "vite-plugin-eslint";

// import mkcert from "vite-plugin-mkcert";

export default defineConfig({
  plugins: [preact(), eslint()],
});
