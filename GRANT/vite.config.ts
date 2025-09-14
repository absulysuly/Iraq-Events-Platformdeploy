import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  // Set the project root to the 'frontend' directory where index.html lives
  root: 'frontend',
  // Tell Vite to look for .env files in the parent directory (the GRANT project root)
  envDir: '..',
  plugins: [react()],
  build: {
    // Output build files to 'dist' at the project root, not 'frontend/dist'
    outDir: '../dist',
    emptyOutDir: true,
  }
});