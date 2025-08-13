import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';

await mkdir('public/assets', { recursive: true });

await build({
  entryPoints: {
    'admin-dropdown': 'frontend/admin-dropdown.ts',
    'admin': 'frontend/admin.ts',
    'contact': 'frontend/contact.ts',
  },
  outdir: 'public/assets',
  bundle: true,
  format: 'esm',
  platform: 'browser',
  sourcemap: true,
  target: ['es2020'],
});
console.log('Frontend built to public/assets');