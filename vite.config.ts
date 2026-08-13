import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  server: {
    port: 5173,
    open: false
  },
  build: {
    chunkSizeWarningLimit: 700,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/src/core/training")) return "training";
          if (id.includes("/src/core/trials")) return "trial";
          if (id.includes("/src/ui/")) return "ui";
          if (id.includes("/src/core/story")) return "story";
          return undefined;
        }
      }
    }
  }
});
