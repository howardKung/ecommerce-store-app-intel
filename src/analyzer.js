const APP_SIGNATURES = [
  { name: 'Klaviyo', category: 'Email/SMS', patterns: ['klaviyo.com', 'static.klaviyo.com'] },
  { name: 'Attentive', category: 'Email/SMS', patterns: ['attn.tv', 'attentivemobile.com'] },
  { name: 'Postscript', category: 'Email/SMS', patterns: ['postscript.io'] },
  { name: 'Omnisend', category: 'Email/SMS', patterns: ['omnisend.com', 'omnisnippet1.com'] },
  { name: 'Recharge', category: 'Subscriptions', patterns: ['rechargeapps.com', 'rechargecdn.com'] },
  { name: 'Skio', category: 'Subscriptions', patterns: ['skio.com'] },
  { name: 'Loop Subscriptions', category: 'Subscriptions', patterns: ['loopwork.co'] },
  { name: 'Yotpo', category: 'Reviews/Loyalty', patterns: ['yotpo.com', 'staticw2.yotpo.com'] },
  { name: 'Judge.me', category: 'Reviews/Loyalty', patterns: ['judge.me'] },
  { name: 'Okendo', category: 'Reviews/Loyalty', patterns: ['okendo.io'] },
  { name: 'Stamped.io', category: 'Reviews/Loyalty', patterns: ['stamped.io'] },
  { name: 'Loox', category: 'Reviews/Loyalty', patterns: ['loox.io'] },
  { name: 'Trustpilot', category: 'Reviews/Loyalty', patterns: ['trustpilot.com'] },
  { name: 'Gorgias', category: 'Support/CX', patterns: ['gorgias.chat', 'gorgias.io'] },
  { name: 'Zendesk', category: 'Support/CX', patterns: ['zdassets.com', 'zendesk.com'] },
  { name: 'Intercom', category: 'Support/CX', patterns: ['intercom.io', 'intercomcdn.com'] },
  { name: 'Tidio', category: 'Support/CX', patterns: ['tidio.co'] },
  { name: 'Rebuy', category: 'Upsell/CRO', patterns: ['rebuyengine.com'] },
  { name: 'Tapcart', category: 'Mobile App', patterns: ['tapcart.com'] },
  { name: 'Triple Whale', category: 'Attribution', patterns: ['triplewhale.com', 'config-security.com'] },
  { name: 'Elevar', category: 'Attribution', patterns: ['getelevar.com'] },
  { name: 'Northbeam', category: 'Attribution', patterns: ['northbeam.io'] },
  { name: 'Meta Pixel', category: 'Ads/Pixel', patterns: ['connect.facebook.net', 'fbevents.js'] },
  { name: 'TikTok Pixel', category: 'Ads/Pixel', patterns: ['analytics.tiktok.com'] },
  { name: 'Google Tag Manager', category: 'Analytics', patterns: ['googletagmanager.com'] },
  { name: 'Hotjar', category: 'CRO/Heatmaps', patterns: ['hotjar.com'] },
  { name: 'Microsoft Clarity', category: 'CRO/Heatmaps', patterns: ['clarity.ms'] },
  { name: 'Shop Pay', category: 'Payments', patterns: ['shopify-payment-button', 'shop.app/pay'] },
  { name: 'Klarna', category: 'BNPL', patterns: ['klarna.com', 'klarnaservices.com'] },
  { name: 'Afterpay', category: 'BNPL', patterns: ['afterpay.com', 'static.afterpay.com'] },
  { name: 'Affirm', category: 'BNPL', patterns: ['affirm.com', 'cdn1.affirm.com'] }
];

export function normalizeDomain(raw) {
  let s = String(raw || '').trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0].split('?')[0];
  return s;
}

async function safeFetch(url, timeoutMs = 8000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StoreIntelBot/1.0; +https://apify.com/howardkung)',
        'Accept': 'text/html,application/json,application/xml;q=0.9,*/*;q=0.8'
      }
    });
  } finally {
    clearTimeout(timer);
  }
}

function scrubPiiString(val) {
  if (typeof val !== 'string') return val;
  return val.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED]');
}

export async function analyzeStore(rawInput) {
  const domain = normalizeDomain(rawInput);
  if (!domain || !domain.includes('.')) {
    return { domain: rawInput, status: 'invalid_input', charged: false };
  }

  let html = '';
  let headersObj = {};
  let finalUrl = `https://${domain}`;
  try {
    let res = await safeFetch(`https://${domain}`, 8000);
    if (!res.ok && res.status >= 500) {
      res = await safeFetch(`https://www.${domain}`, 8000);
    }
    finalUrl = res.url || finalUrl;
    res.headers.forEach((v, k) => { headersObj[k.toLowerCase()] = v; });
    const buf = await res.text();
    html = buf.slice(0, 220000);
  } catch {
    return {
      domain,
      platform: null,
      currency: null,
      detectedAppsCount: 0,
      detectedApps: [],
      catalogSource: 'none',
      estimatedProductCount: 0,
      priceMin: null,
      priceMax: null,
      priceMedian: null,
      discountRatioPct: null,
      status: 'unreachable',
      charged: false,
      extractedAt: new Date().toISOString()
    };
  }

  const lowerHtml = html.toLowerCase();
  let platform = 'Custom / Headless';
  if (lowerHtml.includes('cdn.shopify.com') || lowerHtml.includes('shopify.shop') || headersObj['x-shopid']) {
    platform = lowerHtml.includes('shopify.plus') || lowerHtml.includes('checkout.shopify.com') ? 'Shopify (Plus/Modern)' : 'Shopify';
  } else if (lowerHtml.includes('woocommerce') || lowerHtml.includes('/wp-content/plugins/woocommerce')) {
    platform = 'WooCommerce';
  } else if (lowerHtml.includes('bigcommerce.com') || lowerHtml.includes('cdn11.bigcommerce.com')) {
    platform = 'BigCommerce';
  } else if (lowerHtml.includes('mage/cookies') || lowerHtml.includes('magento')) {
    platform = 'Magento';
  }

  const currencyMatch = html.match(/"currency"\s*:\s*"([A-Z]{3})"/) || html.match(/Shopify\.currency\s*=\s*\{\s*"active"\s*:\s*"([A-Z]{3})"/);
  const currency = currencyMatch ? currencyMatch[1] : 'USD';

  const detectedApps = [];
  for (const sig of APP_SIGNATURES) {
    if (sig.patterns.some(p => lowerHtml.includes(p))) {
      detectedApps.push({ name: sig.name, category: sig.category });
    }
  }

  let catalogSource = 'none';
  let estimatedProductCount = 0;
  let priceMin = null, priceMax = null, priceMedian = null, discountRatioPct = null;
  let topProductTypes = [];

  const origin = new URL(finalUrl).origin;

  // 1. Try Shopify /products.json?limit=50
  if (platform.startsWith('Shopify')) {
    try {
      const pRes = await safeFetch(`${origin}/products.json?limit=50`, 6500);
      if (pRes.ok) {
        const pJson = await pRes.json();
        if (Array.isArray(pJson.products) && pJson.products.length > 0) {
          catalogSource = 'shopify_products_json';
          estimatedProductCount = pJson.products.length;
          const prices = [];
          let discounted = 0;
          let totalVariants = 0;
          const typesSet = new Set();
          for (const prod of pJson.products) {
            if (prod.product_type) typesSet.add(scrubPiiString(String(prod.product_type).trim()));
            for (const v of (prod.variants || [])) {
              const pr = parseFloat(v.price);
              const cmp = parseFloat(v.compare_at_price);
              if (!Number.isNaN(pr) && pr > 0) {
                prices.push(pr);
                totalVariants++;
                if (!Number.isNaN(cmp) && cmp > pr) discounted++;
              }
            }
          }
          if (prices.length > 0) {
            prices.sort((a, b) => a - b);
            priceMin = prices[0];
            priceMax = prices[prices.length - 1];
            priceMedian = prices[Math.floor(prices.length / 2)];
            discountRatioPct = totalVariants > 0 ? Math.round((discounted / totalVariants) * 1000) / 10 : 0;
          }
          topProductTypes = [...typesSet].filter(Boolean).slice(0, 8);
        }
      }
    } catch {
      // Fallback to sitemap below
    }
  }

  // 2. Graceful Sitemap Fallback (handles 429 / locked products.json / Headless Shopify / WooCommerce)
  if (catalogSource === 'none') {
    for (const smPath of ['/sitemap_products_1.xml', '/product-sitemap.xml', '/sitemap.xml']) {
      try {
        const sRes = await safeFetch(`${origin}${smPath}`, 6000);
        if (sRes.ok) {
          const xml = await sRes.text();
          const urlMatches = xml.match(/<loc>/g);
          if (urlMatches && urlMatches.length > 0) {
            catalogSource = `sitemap_fallback (${smPath})`;
            estimatedProductCount = urlMatches.length;
            break;
          }
        }
      } catch {
        // continue
      }
    }
  }

  return {
    domain,
    platform,
    currency,
    detectedAppsCount: detectedApps.length,
    detectedApps: detectedApps.map(a => a.name),
    detectedAppsByCategory: detectedApps,
    catalogSource,
    estimatedProductCount,
    priceMin,
    priceMax,
    priceMedian,
    discountRatioPct,
    topProductTypes,
    status: 'ok',
    charged: false,
    extractedAt: new Date().toISOString()
  };
}
