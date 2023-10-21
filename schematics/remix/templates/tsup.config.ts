import { defineConfig } from 'tsup';

export default defineConfig(({ watch }) => ({
  entryPoints: ['src/main.ts'],
  splitting: true,
  format: ['cjs'],
  dts: true,
  bundle: true,
  clean: true,
  sourcemap: true,
  minify: false,
  tsconfig: './tsconfig.nest.json',
  onSuccess: watch
    ? 'node --enable-source-maps dist/main.js --inspect'
    : undefined,
}));