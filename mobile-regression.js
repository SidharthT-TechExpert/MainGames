// Browser-level layout and touch regressions. Run with npm test.
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const puppeteer = require('puppeteer');

const url = pathToFileURL(path.join(__dirname, 'index.html')).href;
const games = ['number-rush', 'memory-matrix', 'color-clash', 'speed-math', 'sequence-recall', 'flexi-switch'];
const devices = [
  { name: 'small phone', width: 320, height: 480, touch: true },
  { name: 'Android phone', width: 360, height: 640, touch: true },
  { name: 'iPhone-sized', width: 390, height: 844, touch: true },
  { name: 'large phone', width: 430, height: 932, touch: true },
  { name: 'phone landscape', width: 667, height: 375, touch: true },
  { name: 'short landscape', width: 568, height: 320, touch: true },
  { name: 'tablet', width: 768, height: 1024, touch: true },
  { name: 'tablet landscape', width: 1024, height: 768, touch: true },
  { name: 'laptop', width: 1366, height: 768, touch: false },
  { name: 'desktop', width: 1920, height: 1080, touch: false },
  { name: '4K desktop', width: 3840, height: 2160, touch: false },
];
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function load(browser, device, offline = false) {
  const page = await browser.newPage();
  await page.setViewport({ width: device.width, height: device.height, deviceScaleFactor: 1,
    isMobile: device.touch, hasTouch: device.touch });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  if (offline) {
    await page.setRequestInterception(true);
    page.on('request', request => /^https?:/.test(request.url()) ? request.abort() : request.continue());
  }
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => !document.getElementById('appPreloader'));
  return { page, errors };
}

async function checkLayout(page, touch) {
  return page.evaluate(touch => {
    const issues = [];
    const arena = document.getElementById('boardArena');
    const bounds = arena.getBoundingClientRect();
    if (document.documentElement.scrollWidth > innerWidth + 1) issues.push('horizontal page overflow');
    if (bounds.left < -1 || bounds.right > innerWidth + 1) issues.push('board outside viewport');
    for (const el of document.querySelectorAll('.game-view:not(.hidden) button, .game-view:not(.hidden) .cell')) {
      const r = el.getBoundingClientRect();
      if (r.top < bounds.top - 1 || r.bottom > bounds.bottom + 1 || r.left < bounds.left - 1 || r.right > bounds.right + 1) {
        issues.push('game control clipped by board');
        break;
      }
      if (touch && (r.width < 43.5 || r.height < 43.5)) {
        issues.push(`game target only ${r.width.toFixed(1)}×${r.height.toFixed(1)}`);
        break;
      }
    }
    if (touch) {
      for (const el of document.querySelectorAll('header button, #diffBox button, #gridModeBox button')) {
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height) continue;
        if (r.width < 43.5 || r.height < 43.5) issues.push(`small control: ${el.id || el.textContent.trim()}`);
        if (r.left < -1 || r.right > innerWidth + 1) issues.push('header/control outside viewport');
      }
    }
    return [...new Set(issues)];
  }, touch);
}

async function checkTouchInteractions(page) {
  await page.evaluate(() => switchGame('number-rush'));
  await delay(250);
  await page.tap('#game-number-rush [data-num="1"]');
  assert.equal(await page.$eval('#score', el => el.textContent), '10');

  await page.evaluate(() => switchGame('color-clash'));
  await page.tap('#colorClashYesBtn');
  await page.evaluate(() => switchGame('speed-math'));
  await page.tap('#mathOptions button');
  await page.evaluate(() => switchGame('sequence-recall'));
  await delay(1800);
  await page.tap('#simon-0');
  await page.evaluate(() => switchGame('flexi-switch'));
  await page.tap('#flexiBtn1');
  assert.deepEqual(await page.evaluate(() => [...document.querySelectorAll('.game-view:not(.hidden) button')].length > 0), true);
}

async function main() {
  const browser = await puppeteer.launch({ headless: true });
  const failures = [];
  async function test(name, callback) {
    try { await callback(); console.log(`PASS ${name}`); }
    catch (error) { failures.push(`${name}: ${error.message}`); console.error(`FAIL ${name}: ${error.message}`); }
  }
  try {
    for (const device of devices) {
      await test(`six games + 6x6 layout: ${device.name}`, async () => {
        const { page, errors } = await load(browser, device);
        try {
          const issues = [];
          for (const game of games) {
            await page.evaluate(id => switchGame(id), game);
            await delay(650);
            issues.push(...(await checkLayout(page, device.touch)).map(issue => `${game}: ${issue}`));
          }
          await page.evaluate(() => { switchGame('number-rush'); setGridMode(36); });
          await delay(650);
          issues.push(...(await checkLayout(page, device.touch)).map(issue => `6x6: ${issue}`));
          assert.deepEqual(errors, [], 'JavaScript errors');
          assert.deepEqual(issues, []);
        } finally { await page.close(); }
      });
    }
    await test('game works with external CDNs unavailable', async () => {
      const { page, errors } = await load(browser, devices[2], true);
      try {
        assert.deepEqual(errors, []);
        await checkTouchInteractions(page);
        assert.deepEqual(errors, []);
        assert.deepEqual(await checkLayout(page, true), []);
      } finally { await page.close(); }
    });
  } finally { await browser.close(); }
  console.log(`\n${failures.length} failed scenario(s).`);
  if (failures.length) process.exitCode = 1;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
