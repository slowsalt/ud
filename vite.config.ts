import { defineConfig } from "vite";

export default defineConfig({
  plugins: [],
  build: {
    modulePreload: { polyfill: false },
  },
});
