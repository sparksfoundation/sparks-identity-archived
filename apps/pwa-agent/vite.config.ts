import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

const ALL_NODE_MODULES = [
  'assert', 'buffer', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 
  'dns', 'domain', 'events', 'fs', 'http', 'https', 'http2', 'module', 'net', 'os', 'path', 
  'punycode', 'process', 'querystring', 'readline', 'repl', 'stream', '_stream_duplex', 
  '_stream_passthrough', '_stream_readable', '_stream_transform', '_stream_writable', 'string_decoder', 
  'sys', 'timers/promises', 'timers', 'tls', 'tty', 'url', 'util', 'vm', 'zlib',
];

// https://vitejs.dev/config/
export default defineConfig({
  appType: 'spa',
  base: '/',
  publicDir: 'public',
  envPrefix: 'SPARKS_',
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: false,
      exclude: [
        'assert', 'child_process', 'cluster', 'console', 'constants', 'crypto', 'dgram', 
        'dns', 'domain', 'events', 'fs', 'http', 'https', 'http2', 'module', 'net', 'os', 'path', 
        'punycode', 'process', 'querystring', 'readline', 'repl', 'stream', '_stream_duplex', 
        '_stream_passthrough', '_stream_readable', '_stream_transform', '_stream_writable', 'string_decoder', 
        'sys', 'timers/promises', 'timers', 'tls', 'tty', 'url', 'util', 'vm', 'zlib',
      ]
    }),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['fonts/*.ttf', '*.svg'],
      manifest: {
        name: 'sparks-id',
        short_name: 'sparks-id',
        description: 'sparks identity wallet',
        start_url: '/',
        display: 'standalone',
        background_color: '#151515',
        theme_color: '#151515',
        lang: 'en',
        scope: '/',
        icons: [
          {
            src: "icons/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icons/manifest-icon-192.maskable.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "icons/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "icons/manifest-icon-512.maskable.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    }),
    tsconfigPaths(),
  ]
})
