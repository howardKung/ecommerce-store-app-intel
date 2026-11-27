# Shopify & WooCommerce Store Intel & App-Stack Detector (Zero-PII)

Fast, **zero-browser StoreLeads alternative** built for **DTC marketing agencies, Klaviyo/SMS consultants, Clay tables, n8n workflows, and AI SDR agents**.

## Why Use This Actor?
- **Zero-Browser Speed**: Pure HTTP + JSON + Sitemap extraction (no slow headless Chromium).
- **30+ High-Ticket E-Commerce App & Pixel Signatures**: Instantly detect `Klaviyo`, `Attentive`, `Postscript`, `Recharge`, `Skio`, `Yotpo`, `Judge.me`, `Okendo`, `Gorgias`, `Rebuy`, `Triple Whale`, `Northbeam`, `Elevar`, `Meta/TikTok Pixel`, `Klarna`, `Affirm`, and more.
- **Anti-429 Graceful Sitemap Fallback**: Automatically extracts product pricing & discount ratios via `/products.json` when open, and seamlessly falls back to `/sitemap_products_1.xml` when locked or rate-limited.
- **Fair Zero-Charge Protection (`store-intel-extracted`)**: Unreachable or dead domains cost **$0**.
- **Strict Zero-PII Compliance**: Never scrapes customer reviews, buyer names, or personal emails.

## Companion B2B Intelligence Suite
- [**Multi-ATS Career & GTM Buying Signals**](https://apify.com/howardkung/multi-ats-hiring-signals)
- [**Company DNS, Email-Auth & Tech-Stack Signals**](https://apify.com/howardkung/domain-dns-tech-trust-signals)
- [**US Startup Funding Signals (SEC Form D API)**](https://apify.com/howardkung/sec-form-d-funding-signals)

---

## ⚡ Ready-to-Import n8n Automation Workflow

Monitor target DTC brands weekly and push high-spend Shopify/WooCommerce stores straight to Slack and Google Sheets:

1. Download or copy [`examples/n8n-workflow.json`](./examples/n8n-workflow.json) from this repository.
2. In **n8n**, click **Workflows → Import from File** (or paste the JSON directly onto the canvas).
3. Set `APIFY_API_TOKEN` (plus `SLACK_WEBHOOK_URL` or Google Sheets credential) and customize your target store list!

### 🔗 Complete `howardkung` Zero-PII Signal Suite (Cross-Actor Matrix)

| Signal Engine | Best Used For | Apify Store | Ready n8n JSON |
| :--- | :--- | :--- | :--- |
| **Shopify & WooCommerce Store Intel** *(This Actor)* | DTC platform, 30+ paid apps (Klaviyo, Recharge, Yotpo) & pricing | [Apify](https://apify.com/howardkung/ecommerce-store-app-intel) | [`examples/n8n-workflow.json`](./examples/n8n-workflow.json) |
| **DNS, Email-Auth & Tech Stack** | MX/SPF/DMARC cold-email safety, Proofpoint/Mimecast & 85+ DNS tools | [Apify](https://apify.com/howardkung/domain-dns-tech-trust-signals) | [GitHub](https://github.com/howardKung/domain-dns-tech-trust-signals/blob/main/examples/n8n-workflow.json) |
| **Multi-ATS Hiring Signals** | Open roles, 30d velocity & GTM buying signals across 8 ATS APIs | [Apify](https://apify.com/howardkung/multi-ats-hiring-signals) | [GitHub](https://github.com/howardKung/multi-ats-hiring-signals/blob/main/examples/n8n-workflow.json) |
| **US Startup Funding (SEC Form D)** | Newly funded US operating startups (pooled funds filtered out) | [Apify](https://apify.com/howardkung/sec-form-d-funding-signals) | [GitHub](https://github.com/howardKung/sec-form-d-funding-signals/blob/main/examples/n8n-workflow.json) |
| **SEC Form 4 Insider Cluster Buys** | Open-market C-suite stock purchases (`Code P` only) & cluster alerts | [Apify](https://apify.com/howardkung/sec-form4-insider-cluster-buys) | [GitHub](https://github.com/howardKung/sec-form4-insider-cluster-buys/blob/main/examples/n8n-workflow.json) |

