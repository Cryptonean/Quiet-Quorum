import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

const root = path.dirname(fileURLToPath(import.meta.url));

function zkBuildId(): string {
  try {
    const circuits = [
      'registerVoterRoot',
      'createProposal',
      'openProposal',
      'castVote',
      'closeProposal',
      'finalizeProposal',
      'cancelProposal',
    ];
    const hash = createHash('sha256');
    for (const name of circuits) {
      hash.update(readFileSync(path.join(root, `public/zkir/${name}.bzkir`)));
    }
    return hash.digest('hex').slice(0, 12);
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait({
      promiseExportName: '__tla',
      promiseImportName: (index) => `__tla_${index}`,
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      supported: { 'top-level-await': true },
    },
    include: ['@midnight-ntwrk/compact-runtime', 'buffer'],
    exclude: ['@midnight-ntwrk/onchain-runtime-v3'],
  },
  server: {
    port: 5176,
    strictPort: true,
    open: true,
  },
  build: {
    target: 'esnext',
  },
  define: {
    'import.meta.env.VITE_ZK_BUILD_ID': JSON.stringify(zkBuildId()),
  },
});
