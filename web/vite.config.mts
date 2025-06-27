import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';
import path from 'path';
import svgr from 'vite-plugin-svgr';

const config = defineConfig({
  clearScreen: false,
  server: {
    fs: {
      allow: ['.'],
    },
    host: '0.0.0.0',
    port: 3000,
    // For DEVELOPMENT ONLY, we set the secure to false. This is necessary because
    // we are using self signed certs. This still allows us to connect to the Go backend over
    // HTTPS despite self signed certs. In a production app, the backend would use a CA-signed
    // cert and secure:false would be removed.
    proxy: {
       '/api': {
          target: 'https://localhost:443',
          secure: false,
        },
    },
  },
  test: {
    include: ['src/**/*.test.ts(x)'],
    environment: 'jsdom',
    setupFiles: [
      'vitest.setup.ts',
    ],
  },
  plugins: [
    react({
      plugins: [
        [
          '@swc/plugin-styled-components',
          {
            displayName: true,
          },
        ],
      ],
    }),
    svgr(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});

export { config as default };
