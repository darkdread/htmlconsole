import { defineConfig } from "vite";
// import { viteSingleFile } from "vite-plugin-singlefile";
// import svgLoader from "vite-svg-loader";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
  build: {
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    polyfillModulePreload: false
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  server: {
    open: true
  }
});
