import { Actor } from 'apify';
import { analyzeStore } from './analyzer.js';

await Actor.init();

const input = (await Actor.getInput()) || {};
const stores = Array.isArray(input.stores) && input.stores.length > 0
  ? input.stores
  : ['allbirds.com', 'beardbrand.com', 'ridge.com'];
const concurrency = Math.min(15, Math.max(1, Number(input.concurrency) || 5));

let found = 0;
let notFound = 0;
let chargedEvents = 0;
let budgetReached = false;

for (let i = 0; i < stores.length && !budgetReached; i += concurrency) {
  const batch = stores.slice(i, i + concurrency);
  const results = await Promise.all(batch.map(s => analyzeStore(s)));

  for (const item of results) {
    if (item.status === 'ok') {
      found++;
      try {
        const chargeRes = await Actor.charge({ eventName: 'store-intel-extracted', count: 1 });
        item.charged = true;
        chargedEvents++;
        if (chargeRes?.eventChargeLimitReached) {
          budgetReached = true;
        }
      } catch {
        item.charged = true;
      }
    } else {
      notFound++;
      item.charged = false;
    }
    await Actor.pushData(item);
    if (budgetReached) break;
  }
}

console.log(`Completed! Total=${stores.length} | Found=${found} | Unreachable(0-Charge)=${notFound} | ChargedEvents=${chargedEvents}`);
await Actor.exit();
