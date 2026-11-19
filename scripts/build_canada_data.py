"""Build the historical public procurement pilot from manually verified source observations.

Source dates are preserved; this is not an automated current-data collector.
See dist/data/canada-research.md for scope and field-level limitations.
"""
from pathlib import Path
import json,csv
base=Path(__file__).resolve().parent.parent / 'dist'
urls={
'pspc2022':'https://www.canada.ca/en/public-services-procurement/corporate/transparency/briefing-materials/2022-minister-transition-book-2/core-responsability-1-purchase-goods-services.html',
'phac2022':'https://search.open.canada.ca/qpnotes/record/hc-sc,HC-2022-QP1-00051',
'pspc2021':'https://www.canada.ca/en/public-services-procurement/corporate/transparency/briefing-materials/standing-committee-government-operations-estimates/2021-04-14/procurement.html',
'ethi':'https://www.ourcommons.ca/documentviewer/en/43-2/ETHI/report-2/page-51',
'ppe':'https://www.canada.ca/en/public-services-procurement/corporate/transparency/briefing-materials/standing-committee-public-accounts/2022-02-10/procurement-personal-protective-equipment.html'}
rows=[
('gloves','Medical gloves','pair',1562491878,1562491878,'A barrier used during patient care and laboratory work.',None,'No category-wide manufacturing split verified in the collected sources.'),
('surgical','Surgical masks','each',482186370,459065270,'Masks used to provide a protective barrier.',50,'PHAC reported a 50% domestic share in its June 2022 note.'),
('n95','N95 respirators','each',327932460,217200800,'Respirators used for protection from airborne particles.',70,'PHAC reported approximately 70% domestic production, including multi-year contracts.'),
('gowns','Medical gowns','each',153087049,153087049,'Protective clothing used during care.',None,'PHAC reported a 25% domestic share for disposable gowns only. This quantity includes a broader gown category; no matching share is assigned.'),
('shields','Face shields','each',60324810,60324810,'Face protection used alongside other protective equipment.',100,'PHAC reported 100% domestic production in its June 2022 note.'),
('sanitizer','Hand sanitizer','litre',20646000,20646000,'Hand hygiene supplies.',None,'Canadian production is documented; the collected sources do not provide a matched category-wide percentage.'),
('ventilators','Ventilators','each',27706,27706,'Equipment that supports breathing.',None,'Canadian manufacturing contracts are documented; no matched manufacturing-country split is assigned.')]
data={'collected':'2026-11-19','scope':'Federal COVID-19 procurement; selected medical categories, cumulative as of August 31, 2022','quantity_date':'2022-08-31','origin_date':'2022-06-23','sources':urls,'records':[],'contract_examples':[
{'item':'Ventilators — FTI contract','contract_date':'2020-04-11','contract_value_cad':237300000,'quantity':10000,'unit':'ventilator','origin':'Canada: manufacturing documented; components can be international','source':urls['ethi'],'note':'Contract value per planned ventilator. Package includes accessories and production-related costs; not a standalone equipment price or final paid cost.'},
{'item':'Gowns — initial Stanfield contract','contract_date':'2020-04-05','contract_value_cad':27911000,'quantity':2600000,'unit':'gown','origin':'Canada: domestic manufacturing documented','source':urls['pspc2021'],'note':'Initial contract value per planned gown. The source describes retooling support within the contract; not an audited final unit price.'}]}
for id,item,unit,ordered,received,use,share,note in rows:
 data['records'].append(dict(id=id,item=item,unit=unit,ordered=ordered,received=received,use=use,domestic_percent=share,origin_note=note,quantity_source=urls['pspc2022'],origin_source=urls['phac2022'] if id in ['surgical','n95','gowns','shields'] else urls['ppe'] if id=='ventilators' else urls['pspc2021'] if id=='sanitizer' else None,unit_price_cad=None))
(base/'data/canada-procurement.json').write_text(json.dumps(data,indent=2)+'\n')
(base/'data/canada-procurement.js').write_text('window.CANADA_PROCUREMENT = '+json.dumps(data,ensure_ascii=False)+';\n')
with (base/'data/canada-procurement.csv').open('w') as f:
 w=csv.writer(f);w.writerow(['item','unit','ordered','received','quantity_as_of','quantity_source','manufacturing_evidence','origin_evidence_source','origin_evidence_date','unit_price_cad'])
 for r in data['records']: w.writerow([r['item'],r['unit'],r['ordered'],r['received'],data['quantity_date'],r['quantity_source'],r['origin_note'],r['origin_source'] or '',data['origin_date'] if r['id'] in ['surgical','n95','gowns','shields'] else '', ''])
(base/'data/procurement-template.csv').write_text('row_id,product_id,item,buyer,fiscal_year,unit,quantity,net_cost_cad,manufacturing_country,source\n')
