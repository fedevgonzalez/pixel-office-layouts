#!/usr/bin/env node
/**
 * Takes preview screenshots of all gallery layouts using Playwright.
 * Requires: npx playwright install chromium
 * Usage: node scripts/take-screenshots.js [port]
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 3301;
const BASE_URL = `http://localhost:${PORT}`;
const LAYOUTS_DIR = path.join(__dirname, '..', 'layouts');

const LAYOUT_IDS = [
  'default-office', 'open-plan', 'small-studio', 'tech-startup',
  'l-shaped-office', 'library-study', 'command-center', 'cozy-cabin',
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });

  await page.goto(BASE_URL);
  // Wait for canvas to appear
  await page.waitForSelector('canvas', { timeout: 10000 });
  await page.waitForTimeout(2000);

  // Create a dedicated WebSocket for importing layouts
  await page.evaluate(() => {
    return new Promise((resolve) => {
      const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${location.host}`);
      ws.onopen = () => {
        window.__ssWs = ws;
        resolve();
      };
      setTimeout(resolve, 5000);
    });
  });

  for (const id of LAYOUT_IDS) {
    const layoutPath = path.join(LAYOUTS_DIR, id, 'layout.json');
    const layout = JSON.parse(fs.readFileSync(layoutPath, 'utf-8'));

    // Import layout via WebSocket
    await page.evaluate((layoutData) => {
      return new Promise((resolve) => {
        const ws = window.__ssWs;
        ws.send(JSON.stringify({ type: 'importGalleryLayout', layout: layoutData }));
        const handler = (e) => {
          try {
            const msg = JSON.parse(e.data);
            if (msg.type === 'layoutLoaded') {
              ws.removeEventListener('message', handler);
              resolve();
            }
          } catch {}
        };
        ws.addEventListener('message', handler);
        setTimeout(resolve, 5000);
      });
    }, layout);

    // Wait for re-render
    await page.waitForTimeout(1500);

    // Screenshot the canvas element
    const canvas = page.locator('canvas').first();
    const outPath = path.join(LAYOUTS_DIR, id, 'preview.png');
    await canvas.screenshot({ path: outPath });
    console.log(`✓ ${id}: ${outPath}`);
  }

  await browser.close();
  console.log('\nDone! All previews saved.');
}

main().catch(e => { console.error(e); process.exit(1); });
