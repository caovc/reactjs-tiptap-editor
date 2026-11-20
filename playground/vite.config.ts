import * as path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode !== 'production';
  const isAnalyze = mode === 'analyze';

  return {
    base: process.env.PAGES_BASE_PATH || '/',
    define: {
      'process.env': {},
    },
    plugins: [react()],
    optimizeDeps: {
      include: ['react'],
    },
    css: {
      devSourcemap: isDev,
    },
    build: {
      sourcemap: isAnalyze,
      rollupOptions: {
        input: {
          playground: path.resolve(import.meta.dirname, 'index.html'),
          sap: path.resolve(import.meta.dirname, 'sap/index.html'),
        },
      },
    },
    resolve: {
      alias: [
        {
          find: '@/components/reui',
          replacement: path.resolve(import.meta.dirname, '../src/components/reui'),
        },
        {
          find: '@/lib/utils',
          replacement: path.resolve(import.meta.dirname, '../src/lib/utils.ts'),
        },
        { find: '@', replacement: path.resolve(import.meta.dirname, 'src') },
      ],
      // The linked workspace package resolves 'react' from the repo root; force a single copy.
      dedupe: ['react', 'react-dom'],
    },
    server: {
      host: '0.0.0.0',
      port: 8000,
    },
    preview: {
      host: '0.0.0.0',
      port: 8000,
    },
  };
});
