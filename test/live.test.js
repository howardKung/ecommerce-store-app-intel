import assert from 'node:assert/strict';
import { analyzeStore } from '../src/analyzer.js';

const LIVE_STORES = [
  'allbirds.com',
  'beardbrand.com',
  'ridge.com',
  'brooklinen.com',
  'ruggable.com'
];

console.log('Running live E-Commerce Store Intel & Zero-PII verification...');
const t0 = Date.now();
const results = await Promise.all(LIVE_STORES.map(s => analyzeStore(s)));
const dead = await analyzeStore('nonexistent-dead-store-999999.invalid');
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);

let okCount = 0;
for (const r of results) {
  if (r.status === 'ok') okCount++;
  const serialized = JSON.stringify(r);
  assert.equal(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/.test(serialized), false, `PII email leak in ${r.domain}`);
  console.log(`  [OK] ${r.domain.padEnd(18)} | platform=${r.platform.padEnd(22)} | apps=${r.detectedAppsCount} | catalog=${r.catalogSource} (${r.estimatedProductCount})`);
}

assert.ok(okCount >= 4, `Expected at least 4 live stores to resolve, got ${okCount}`);
assert.equal(dead.status, 'unreachable');
assert.equal(dead.charged, false);
console.log(`  [0-CHARGE PASS] ${dead.domain} -> status=${dead.status}, charged=${dead.charged}`);
console.log(`ALL TESTS PASSED in ${elapsed}s!`);
