# Medtech Trade Observatory

A buildless, public-facing dashboard for five selected US import categories. No accounts, API keys, dependencies, analytics, or backend required. Includes 1,015 observations from the original USITC DataWeb export, retrieved November 11, 2026.

## Data and interpretation

Source: https://dataweb.usitc.gov/trade/search/Import/HTS

Imports for consumption, customs value in actual USD, HTS8; all countries, programs, provision codes and districts. Five codes: 38221900, 38229000, 90189060, 90230000, 90273080. Annual 2025 and January–September 2025/2026. Incomplete annual 2026 zeros are excluded, not interpreted as actual zero imports.

Country share = country value / total value within code and period. CR3 sums the three largest shares. Country HHI sums squared percentage shares across all countries. Positive-value countries are ranked. The country table excludes zero values; the complete CSV/JSON preserves them. Search filters the table only; selected-category export downloads all positive-value countries in the selected code and period.

Country concentration is not firm concentration, substitutability, or imports' share of US consumption. Categories may include nonmedical products. This dashboard does not establish tariff liability, identify affected companies, or demonstrate causation. No tariff rates or unverified company lists are presented.

## Files

- `dist/`: deployable site, styles, script, downloadable CSV/JSON and original Excel source.
- `scripts/import_data.py`: standard-library extraction and reconciliation script.
- `.github/workflows/pages.yml`: optional GitHub Pages deployment.

To reproduce the bundled data: `python3 scripts/import_data.py dist/data/original-dataweb-export.xlsx` (use a separate source path if replacing the included workbook). The script checks all three grand totals and duplicate keys. For a new release, update reporting-period metadata, expected totals, script mappings, and all dates in the UI before publishing. Do not simply replace the workbook with an unrelated export. The snapshot does not auto-update.

This presentation is independent and does not imply agency endorsement.
