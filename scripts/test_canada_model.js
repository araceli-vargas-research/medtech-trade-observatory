'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const M=require('../dist/canada-model.js');
const header='row_id,product_id,item,buyer,fiscal_year,unit,quantity,net_cost_cad,manufacturing_country,source\n';
const csv=header+'1,p1,"Mask, surgical",Hospital A,2025-26,each,100,200,Canada,https://example.org/a\r\n'+
'2,p1,"Mask, surgical",Hospital A,2025-26,each,300,300,Malaysia,https://example.org/b\n'+
'3,p2,Respirator,Hospital A,2025-26,each,10,,Unknown,https://example.org/c\n'+
'4,p3,Glove,Hospital A,2025-26,pair,1000,300,Canada,https://example.org/d\n'+
'5,p1,"Mask, surgical",Hospital B,2025-26,each,500,500,Canada,https://example.org/e\n'+
'6,p1,"Mask, surgical",Hospital A,2024-25,each,50,100,Canada,https://example.org/f\n'+
'7,p2,Respirator,Hospital A,2025-26,each,10,50,Canada,https://example.org/g\n';
const rows=M.loadCSV(csv),g=M.aggregate(rows,'Hospital A','2025-26','each');
assert.equal(g.length,2);assert.equal(g[0].quantity,400);assert.equal(g[0].cost,500);assert.equal(g[0].unitPrice,1.25);
assert.equal(g[0].countries.find(c=>c.name==='Canada').quantity/g[0].quantity,0.25);
assert.equal(g[0].countries.find(c=>c.name==='Canada').cost/g[0].cost,0.4);
assert.equal(g[1].quantity,20);assert.equal(g[1].unitPrice,null);assert.equal(g[1].countries.find(c=>c.name==='Unknown').quantity,10);
assert.equal(M.aggregate(rows,'Hospital A','2025-26','pair')[0].quantity,1000);
assert.equal(M.parseCSV('a,b\n"two\nlines","a""b"')[1][1],'a"b');
for(const [bad,pattern] of [
 [csv+'1,p4,Other,Hospital A,2025-26,each,1,1,Canada,https://example.org',/unique/],
 [csv.replace(',100,200,',',-100,200,'),/positive/],
 [csv.replace(',100,200,',',1.5,200,'),/whole/],
 [csv.replace('https://example.org/a','javascript:alert(1)'),/https/],
 [csv.replace('each,100','box,100'),/normalize/],
 [csv.replace('200,Canada','NaN,Canada'),/nonnegative/],
 [csv.replace('Respirator,Hospital A,2025-26,each','Respirator,Hospital A,2025-26,pair'),/same product_id/],
 ['a,b\n"unclosed',/Unclosed/],
 [header,/Add purchasing/]
])assert.throws(()=>M.loadCSV(bad),pattern);
const zero=M.loadCSV(header+'z,z,Zero,Hospital,2025,each,2,0,,https://example.org');
assert.equal(M.aggregate(zero,'Hospital','2025','each')[0].unitPrice,0);
const data=JSON.parse(fs.readFileSync('dist/data/canada-procurement.json','utf8'));
assert.equal(data.records.length,7);assert.equal(data.records.filter(r=>r.unit==='each').length,5);
assert(data.records.every(r=>r.received<=r.ordered&&r.unit_price_cad===null));
assert.equal(data.records.find(r=>r.id==='gowns').domestic_percent,null);
assert.equal(data.contract_examples[0].contract_value_cad/data.contract_examples[0].quantity,23730);
console.log('Passed: scoped aggregation, weighted prices, unknown origin, units, CSV quoting, validation and public evidence consistency.');

// Exercise both page modes without a browser; layout still needs visual review.
const vm=require('node:vm');
const nodes=new Map();
function node(id){if(!nodes.has(id))nodes.set(id,{value:({dataset:'public',unit:'each',basis:'received'})[id]||'',innerHTML:'',textContent:'',hidden:false,setAttribute(){},querySelectorAll(){return []},querySelector(){return null},append(){}});return nodes.get(id)}
const context={window:{},document:{getElementById:node,createElement:()=>({})},Intl,URL,console};vm.createContext(context);
for(const f of ['dist/data/canada-procurement.js','dist/canada-model.js','dist/canada.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
assert(node('ranking-content').innerHTML.includes('459,065,270'));
assert.equal(node('coverage').textContent,'5 shown · 5 categories in this unit');
node('price-view').onclick();assert(node('ranking-content').innerHTML.includes('No verified item prices'));
node('quantity-view').onclick();node('unit').value='pair';node('unit').onchange();
assert(node('ranking-content').innerHTML.includes('1,562,491,878'));
context.inputCSV=csv;
vm.runInContext('uploaded=M.loadCSV(inputCSV)',context);
node('dataset').value='uploaded';node('buyer').value='Hospital A';node('year').value='2025-26';node('unit').value='each';
node('unit').onchange();assert(node('ranking-content').innerHTML.includes('Mask, surgical'));
assert(node('item-detail').innerHTML.includes('Canada 25.0%'));
node('price-view').onclick();assert(node('ranking-content').innerHTML.includes('$1.25'));
assert(node('ranking-note').textContent.includes('1 products excluded'));
assert(!node('ranking-content').innerHTML.includes('Respirator'));
console.log('Passed: public quantity and empty price views, separate units, uploaded rankings and origin display.');
