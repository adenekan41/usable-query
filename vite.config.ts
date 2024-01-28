import dts from 'vite-plugin-dts';
import { defineConfig } from 'vite';
import path from 'path';

import packgeJson from './package.json';

const ignoreDeps = [''];
const externalPackages = Object.keys(packgeJson.dependencies).filter(
  (k) => !ignoreDeps.includes(k)
);

export default defineConfig(async () => ({
  esbuild: {
    minifySyntax: true,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),

    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'UsableQuery',
      formats: ['es', 'umd'],
      fileName: (format) => `index.${format}.js`,
    },
    rollupOptions: {
      external: [...externalPackages],
      output: {
        globals: {
          ...externalPackages.reduce((acc, curr) => {
            acc[curr] = curr;
            return acc;
          }, {}),
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
