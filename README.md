# Medtech Trade Observatory

A buildless, public-facing dashboard for five selected US import categories. No accounts, API keys, dependencies, analytics, or backend required. Includes 1,015 observations from the original USITC DataWeb export, retrieved November 11, 2026.

## Data and interpretation

Source: https://dataweb.usitc.gov/trade/search/Import/HTS

Imports for consumption, customs value in actual USD, HTS8; all countries, programs, provision codes and districts. Five codes: 38221900, 38229000, 90189060, 90230000, 90273080. Annual 2025 and January–September 2025/2026. Incomplete annual 2026 zeros are excluded, not interpreted as actual zero imports.

Country share = country value / total value within code and period. CR3 sums the three largest shares. Country HHI sums squared percentage shares across all countries. Positive-value countries are ranked. The country table excludes zero values; the complete CSV/JSON preserves them. Search filters the table only; selected-category export downloads all positive-value countries in the selected code and period.

Country concentration is not firm concentration, substitutability, or imports' share of US consumption. Categories may include nonmedical products. This dashboard does not establish tariff liability, identify affected companies, or demonstrate causation. The policy context cites the October 23, 2026 Section 338 proclamation and its annexes, which add these five categories to the Canada-specific additional 50% tariff effective October 30, 2026. The US$1,024,222,992 annual baseline is the sum of Canada’s 2025 imports across the five codes, not duty paid. All displayed trade periods predate this expansion. Category examples are illustrative; source links appear in Sources & Methods. No unverified company lists are presented.

## Files

- `dist/`: deployable site, styles, script, downloadable CSV/JSON and original Excel source.
- `dist/brand.css` and `dist/brand/`: CCC brand styling, logo, locally bundled typefaces, font licenses and source metadata.
- `scripts/import_data.py`: standard-library extraction and reconciliation script.
- `.github/workflows/pages.yml`: optional GitHub Pages deployment.

To reproduce the bundled data: `python3 scripts/import_data.py dist/data/original-dataweb-export.xlsx` (use a separate source path if replacing the included workbook). The script checks all three grand totals and duplicate keys. For a new release, update reporting-period metadata, expected totals, script mappings, and all dates in the UI before publishing. Do not simply replace the workbook with an unrelated export. The snapshot does not auto-update.

This presentation is independent and does not imply agency endorsement.

## Canadian procurement companion

Open `canada.html` from the same static server (`http://localhost:8000/canada.html`). It is a separate historical federal COVID-19 procurement pilot, not a national ranking of current hospital purchases. Seven medical categories are transcribed from PSPC’s August 31, 2022 quantity table; two nonmedical mask categories are excluded. June 2022 manufacturing statements are displayed separately and are never multiplied by the August totals. No item prices are inferred for that table. Two contract-value-per-planned-unit examples are labeled separately from product prices.

- `dist/data/canada-research.md`: collection log, sources, limitations and next data requirements.
- `dist/data/canada-procurement.{json,js,csv}`: collected observations and evidence metadata.
- `scripts/build_canada_data.py`: rebuild the data files from the verified observations; does not fetch updates.
- `dist/canada-model.js`: CSV validation and procurement aggregation.
- `dist/data/procurement-template.csv`: blank purchasing-data template.

The companion can load actual purchase lines locally in the browser. Select one buyer, fiscal year and normalized unit. Quantity and weighted unit-cost rankings show up to ten products within that scope. Cost rankings exclude products with missing line costs. Manufacturing shares include unknown origin in their denominators; spending shares require complete costs and a positive total. Imported origins are declarations in the file, not independently certified. Normalize pack sizes, use CAD net costs on a consistent basis, and group equivalent products before importing. No files are uploaded or persisted.

Validation: `node scripts/test_canada_model.js`.

## Cloudflare Workers deployment

The `workers.dev` site is separate from the optional GitHub Pages workflow. The tracked `wrangler.jsonc` deploys `dist/` to the existing Worker named `medtech-trade-observatory`. From this checkout, run `npx wrangler login` with the owning Cloudflare account, then `npx wrangler deploy`. The expected production URL is https://medtech-trade-observatory.araceli-fd2.workers.dev.

For automatic Cloudflare deployments, connect this GitHub repository to that Worker in Cloudflare Workers Builds, select `main`, leave the build command empty (the site is buildless), and use `npx wrangler deploy` as the deploy command. A successful GitHub push alone does not verify a Cloudflare deployment.
