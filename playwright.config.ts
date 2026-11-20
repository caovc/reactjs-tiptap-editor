import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    actionTimeout: 10_000,
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173/reactjs-tiptap-editor/',
    viewport: { width: 1440, height: 1000 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : [
        {
          command:
            'PAGES_BASE_PATH=/reactjs-tiptap-editor/ pnpm --dir playground exec vite preview --host 127.0.0.1 --port 4173 --strictPort',
          url: 'http://127.0.0.1:4173/reactjs-tiptap-editor/',
          reuseExistingServer: !process.env.CI,
        },
        {
          command: 'pnpm exec vite --config tests/vite.config.ts',
          url: 'http://127.0.0.1:5199/tests/reui-controls.html',
          reuseExistingServer: !process.env.CI,
        },
      ],
});
