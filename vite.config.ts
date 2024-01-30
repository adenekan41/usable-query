import path from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import packgeJson from './package.json';

const ignoreDeps = ['axios'];
const externalPackages = Object.keys(packgeJson.dependencies).filter(
  (k) => !ignoreDeps.includes(k)
);

export default defineConfig(async () => ({
  esbuild: {
    minifySyntax: true,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    minify: true,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UsableQuery',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [...externalPackages, '@tanstack/react-query'],
      output: {
        globals: {
          ...externalPackages.reduce((acc, curr) => {
            acc[curr] = curr;
            return acc;
          }, {}),
          '@tanstack/react-query': 'ReactQuery',
        },
      },
    },
  },

  plugins: [
    dts({
      include: ['src'],
      tsConfigFilePath: path.resolve(__dirname, './tsconfig.json'),
      compilerOptions: {
        declaration: true,
        emitDeclarationOnly: true,
      },
    }),
  ],
}));
