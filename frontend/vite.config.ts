import { defineConfig } from 'vite';

// The frontend is a standalone Vite app. In dev, Vite serves index.html with
// HMR and proxies API calls to the Express backend so the browser still sees a
// single origin (fetch('/api/...') keeps working with API_BASE = '').
// In prod, `vite build` emits static assets to dist/ to be served on their own.
export default defineConfig({
    root: __dirname,
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        sourcemap: true,
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:5001',
                changeOrigin: true,
                // AI endpoints stream via SSE; disable buffering so chunks flow.
                configure: (proxy) => {
                    proxy.on('proxyRes', (proxyRes) => {
                        proxyRes.headers['cache-control'] = 'no-cache';
                    });
                },
            },
        },
    },
});
