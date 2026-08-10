import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js')) {
              return 'chart';
            }
            if (id.includes('canvas-confetti')) {
              return 'effects';
            }
            if (id.includes('lucide')) {
              return 'icons';
            }
            return 'vendor';
          }
        }
      }
    }
  }
});
