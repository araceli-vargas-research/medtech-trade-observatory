"""Convert the original DataWeb export using only Python's standard library.
Usage: python scripts/import_data.py path/to/export.xlsx
"""
import csv, json, sys, zipfile, shutil
from pathlib import Path
from decimal import Decimal
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[1]
out = root / 'dist' / 'data'
out.mkdir(parents=True, exist_ok=True)
source = Path(sys.argv[1])
ns = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
records, descriptions = [], {}
with zipfile.ZipFile(source) as z:
    strings = [''.join(x.itertext()) for x in ET.fromstring(z.read('xl/sharedStrings.xml'))]
    for sheet, periods in [('sheet2.xml', [(4, '2025')]), ('sheet3.xml', [(4, '2025-ytd'), (5, '2026-ytd')])]:
        xml = ET.fromstring(z.read('xl/worksheets/' + sheet))
        for row in xml.findall('.//m:row', ns):
            cells = []
            for c in row:
                value = ''.join(c.itertext())
                if c.get('t') == 's': value = strings[int(value)]
                cells.append(value)
            if len(cells) != 6 or cells[0] != 'Customs Value': continue
            _, country, code, description, _, _ = cells
            assert len(code) == 8 and code.isdigit()
            descriptions[code] = description
            for col, period in periods:
                records.append({'period': period, 'code': code, 'country': country, 'value': int(Decimal(cells[col]))})
expected = {'2025': 10981090640, '2025-ytd': 8560544159, '2026-ytd': 7092413560}
for period, total in expected.items():
    assert sum(r['value'] for r in records if r['period'] == period) == total, period
assert len({(r['period'], r['code'], r['country']) for r in records}) == len(records)
payload = {'retrieved': '2026-11-11', 'source': 'https://dataweb.usitc.gov/trade/search/Import/HTS', 'descriptions': descriptions, 'records': records}
(out / 'imports.json').write_text(json.dumps(payload, indent=2))
(out / 'imports.js').write_text('window.IMPORT_DATA = ' + json.dumps(payload) + ';\n')
with (out / 'imports.csv').open('w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['period', 'code', 'country', 'value'])
    writer.writeheader(); writer.writerows(records)
if source.resolve() != (out / 'original-dataweb-export.xlsx').resolve():
    shutil.copyfile(source, out / 'original-dataweb-export.xlsx')
print(f'Validated {len(records)} records against all three source totals.')
