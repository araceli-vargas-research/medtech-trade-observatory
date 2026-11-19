# Canadian medical procurement: collection notes

Collected November 19, 2026. This is a historical public-data pilot, not a current nationwide purchasing census.

## Verified quantitative evidence

1. PSPC, 2022 Minister’s Transition Book 2, “Pandemic response”, Table 1, information as of August 31, 2022. Seven medical categories retained; nonmedical face coverings and cloth masks excluded. Quantities are cumulative ordered/received, not annual usage. N95 and surgical-mask orders include long-term contracts. Units are preserved (each, pair, litre), and rankings never mix them.
https://www.canada.ca/en/public-services-procurement/corporate/transparency/briefing-materials/2022-minister-transition-book-2/core-responsability-1-purchase-goods-services.html

2. Health Canada, Question Period Note HC-2022-QP1-00051, received June 23, 2022, “If pressed on domestic PPE manufacturing”. Separate historical domestic-production percentages are recorded for N95 respirators, surgical masks and face shields. The disposable-gown statement is explained but not attached to the broader gown quantity. No percentage is applied to the August quantity totals. These statements do not identify all foreign manufacturing countries or sourcing shares by spending.
https://search.open.canada.ca/qpnotes/record/hc-sc,HC-2022-QP1-00051

3. House of Commons ETHI, report 2 (43-2), “Nature of the Contract”. FTI contract: CAD237,300,000 for 10,000 ventilators. Calculated average CAD23,730 per planned ventilator. Accessories and production-related costs prevent interpretation as a standalone equipment price. Contract dated April 11, 2020 in this source; other government summaries may use an award date rather than the signature date.
https://www.ourcommons.ca/documentviewer/en/43-2/ETHI/report-2/page-51

4. PSPC, OGGO April 14, 2021 briefing, “If pressed on Stanfield medical isolation gowns”. Initial April 5, 2020 contract: CAD27,911,000 for 2.6 million gowns. Calculated average CAD10.735 per planned gown (displayed CAD10.74). Retooling is described in the source. This is not a final invoiced item price.
https://www.canada.ca/en/public-services-procurement/corporate/transparency/briefing-materials/standing-committee-government-operations-estimates/2021-04-14/procurement.html

5. PSPC, Public Accounts February 10, 2022 briefing, ventilator and domestic production context. Used as qualitative evidence, not as a manufacturing-country allocation of the August 2022 total.
https://www.canada.ca/en/public-services-procurement/corporate/transparency/briefing-materials/standing-committee-public-accounts/2022-02-10/procurement-personal-protective-equipment.html

## Other sources reviewed

- CanadaBuys award/contract history coverage describes federal contracting, not all provincial hospital purchasing. Contract values cannot generally establish unit prices without matched quantities and scope.
https://canadabuys.canada.ca/en/support/searching-award-notices-and-contract-history
- CIHI Canadian MIS Database provides hospital/health-authority financial and operational context. The public description does not establish access to the requested nationwide SKU-level quantities, prices and manufacturing countries.
https://www.cihi.ca/en/canadian-management-information-system-database-cmdb-metadata
- Statistics Canada trade statistics describe cross-border flows, not hospital purchases or domestic supply shares. They are not used to populate procurement rankings.
https://www150.statcan.gc.ca/n1/pub/13-605-x/2024001/article/00001-eng.htm
- The October 2026 Auditor General stockpile page was reviewed. Its inventory levels are stocks, not purchasing flows, so they were not added to the procurement list.
https://www.canada.ca/en/auditor-general/our-work/audit-reports/19-auditor-general-202610-public-health-emergency-stockpile.html

## Still needed for the requested full version

One fiscal year of actual purchase lines from participating hospitals, health authorities or purchasing organizations: unique purchase-line ID, comparable product/model ID, description, buyer, fiscal year, standardized quantity and unit, net CAD spending, documented manufacturing country, and evidence link. Pack conversion and included services must be consistent. Manufacturer location is not necessarily manufacturing origin. Multiple-origin lines need a documented quantity/cost allocation; otherwise retain unknown origin.

The public pilot cannot establish a current Canadian top ten by quantity, a top ten by true item price, or complete Canadian/international sourcing shares for either list. The browser CSV workflow implements those calculations for a defined uploaded dataset, without claiming national coverage. Data missing from public sources remains missing.

## Reproduction

Run `python3 scripts/build_canada_data.py` to rebuild the manually transcribed observations and CSV/JSON/JS exports. This does not refresh the sources. Recheck sources and collection dates before updating the pilot. All monetary amounts in the companion are CAD. The existing U.S. trade dashboard continues to use USD.
