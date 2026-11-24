import { existsSync } from 'node:fs'
import { defineConfig } from '@playwright/test'

const systemChromium = '/usr/bin/chromium'
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
  ?? (existsSync(systemChromium) ? systemChromium : undefined)

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.js',
  workers: 2,
  use: {
    baseURL: 'http://localhost:4174',
    browserName: 'chromium',
    viewport: { width: 1440, height: 900 },
    launchOptions: { executablePath },
  },
  webServer: {
    command: 'npm run dev -- --port 4174 --strictPort',
    url: 'http://localhost:4174',
    reuseExistingServer: false,
  },
})
