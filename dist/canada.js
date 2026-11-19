'use strict';
const CA=window.CANADA_PROCUREMENT, M=window.CanadaModel, byId=id=>document.getElementById(id);
const safe=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const count=n=>n.toLocaleString('en-CA',{maximumFractionDigits:3}),cad=n=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:2}).format(n);
const link=(url,label)=>`<a href="${safe(url)}" target="_blank" rel="noopener">${safe(label)}</a>`;
let uploaded=null,view='quantity',selected=null,shareBasis='quantity';
function isPublic(){return byId('dataset').value==='public'}
function currentGroups(){return M.aggregate(uploaded||[],byId('buyer').value,byId('year').value,byId('unit').value)}
function originBar(ca,world,unknown){return `<div class="origin-track" role="img" aria-label="Made in Canada ${ca.toFixed(1)} percent; international ${world.toFixed(1)} percent; unknown ${unknown.toFixed(1)} percent"><span class="origin-ca" style="width:${ca}%"></span><span class="origin-world" style="width:${world}%"></span><span class="origin-unknown" style="width:${unknown}%"></span></div><div class="origin-legend"><span>Canada ${ca.toFixed(1)}%</span><span class="world">International ${world.toFixed(1)}%</span><span class="unknown">Unknown ${unknown.toFixed(1)}%</span></div>`}
function render(){
 const pub=isPublic(),unit=byId('unit').value,basis=byId('basis').value;
 byId('upload-filters').hidden=pub;byId('basis-control').hidden=!pub||view==='price';byId('contracts').hidden=!pub;
 byId('quantity-view').setAttribute('aria-pressed',String(view==='quantity'));byId('price-view').setAttribute('aria-pressed',String(view==='price'));
 byId('ranking-heading').textContent=pub?(view==='price'?'Cost per item: data not available':'Reported procurement quantities'):(view==='price'?'Top ten by cost per item':'Top ten by quantity');
 const all=pub?CA.records.filter(r=>r.unit===unit):currentGroups();
 const eligible=view==='price'?all.filter(r=>r.unitPrice!==null&&r.unitPrice!==undefined):all;
 const val=r=>view==='price'?r.unitPrice:pub?r[basis]:r.quantity;
 const rows=[...eligible].sort((a,b)=>val(b)-val(a)||a.item.localeCompare(b.item)).slice(0,10);
 byId('coverage').textContent=`${rows.length} shown · ${all.length} categories in this unit`;
 byId('ranking-note').textContent=pub?'Historical federal COVID-19 procurement, cumulative to August 31, 2022. Categories are compared within the same unit; this is not a national top-ten list.':`Uploaded records only · ${byId('buyer').value} · ${byId('year').value}. ${all.length-eligible.length} products excluded for incomplete cost information. Cost per item is total net CAD spending divided by total units.`;
 if(!rows.length){
  byId('ranking-content').innerHTML=`<div class="empty-state"><h3>${pub?'No verified item prices in this snapshot':'No eligible records for this view'}</h3><p>${pub?'The published quantity table has no matched item-level spending. Contract averages below are shown separately. Load a buyer’s purchasing records to calculate top-ten lists.':'Choose another unit or provide complete net costs for each purchase line to calculate item prices.'}</p></div>`;
  byId('item-detail').innerHTML='';return;
 }
 byId('ranking-content').innerHTML=`<div class="table-wrap"><table class="canada-table"><caption class="sr-only">${safe(byId('ranking-heading').textContent)} within ${safe(unit)} units</caption><thead><tr><th>Rank in this view</th><th>Item</th><th>${view==='price'?'Average cost / '+unit:pub?basis==='received'?'Quantity received':'Quantity ordered':'Quantity purchased'}</th><th>${pub?'Unit':'Total net spending (CAD)'}</th><th>Manufacturing evidence</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${i+1}</td><td><button type="button" data-id="${safe(r.id)}">${safe(r.item)}</button>${pub?`<small>${safe(r.use)}</small>`:''}</td><td>${view==='price'?cad(val(r)):count(val(r))}</td><td>${pub?safe(r.unit):r.completeCost?cad(r.cost):'Incomplete'}</td><td>${pub?r.domestic_percent===null?'Partial or not reported':'Separate historical statement':r.countries.some(c=>c.name==='Unknown')?'Origin partly or wholly unknown':'Country recorded'}</td></tr>`).join('')}</tbody></table></div>`;
 if(!rows.some(r=>r.id===selected))selected=rows[0].id;
 byId('ranking-content').querySelectorAll('[data-id]').forEach(b=>b.onclick=()=>{selected=b.dataset.id;renderDetail(rows.find(r=>r.id===selected))});
 renderDetail(rows.find(r=>r.id===selected));
}
function renderDetail(r){
 if(isPublic()){
  byId('item-detail').innerHTML=`<h3>${safe(r.item)}: where it is made</h3><p>${safe(r.origin_note)}</p>${r.domestic_percent===null?'':`<p class="source-meta">Separate PHAC statement dated June 23, 2022: ${r.id==='n95'?'approximately ':''}${r.domestic_percent}% Canadian manufacture. Foreign countries are not named; the remainder is not assigned to individual countries.</p>`}<p class="source-meta">The manufacturing evidence is not a breakdown of the August 31 quantity total. No country shares by spending are available, and no missing share is inferred from a Canadian supplier address.</p><p>${link(r.quantity_source,'Quantity source')}${r.origin_source?' · '+link(r.origin_source,'Manufacturing evidence'):''}</p>`;
  return;
 }
 const basis=shareBasis,total=basis==='cost'?r.cost:r.quantity;
 const complete=basis!=='cost'||r.completeCost;
 const countries=r.countries.map(c=>({...c,value:c[basis]})).sort((a,b)=>b.value-a.value);
 let ca=0,world=0,unknown=0;
 for(const c of countries){if(c.name==='Canada')ca+=c.value;else if(c.name==='Unknown')unknown+=c.value;else world+=c.value;}
 byId('item-detail').innerHTML=`<h3>${safe(r.item)}: manufacturing origin</h3><label>Show sourcing by<select id="share-basis"><option value="quantity" ${basis==='quantity'?'selected':''}>Quantity</option><option value="cost" ${basis==='cost'?'selected':''}>Net spending</option></select></label>${complete&&total>0?originBar(ca/total*100,world/total*100,unknown/total*100)+`<div class="table-wrap"><table><caption class="sr-only">Manufacturing origin by ${basis==='cost'?'net spending':'quantity'}</caption><thead><tr><th>Country</th><th>${basis==='cost'?'CAD':'Units'}</th><th>Share</th></tr></thead><tbody>${countries.map(c=>`<tr><td>${safe(c.name)}</td><td>${basis==='cost'?cad(c.value):count(c.value)}</td><td>${(c.value/total*100).toFixed(1)}%</td></tr>`).join('')}</tbody></table></div>`:'<p>Spending shares are unavailable because costs are incomplete or total spending is zero.</p>'}<p class="source-meta">Origin is supplied in the uploaded records and has not been independently verified. Unknown origin remains in the denominator.</p><details><summary>Evidence links (${r.sources.length})</summary><ul>${r.sources.map(s=>`<li>${link(s,s)}</li>`).join('')}</ul></details>`;
 byId('share-basis').onchange=e=>{shareBasis=e.target.value;renderDetail(r)};
}
function options(id,values){byId(id).innerHTML=values.map(x=>`<option value="${safe(x)}">${safe(x)}</option>`).join('')}
function setYears(){options('year',[...new Set(uploaded.filter(r=>r.buyer===byId('buyer').value).map(r=>r.fiscal_year))].sort().reverse())}
byId('upload').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
  if(f.size>10*1024*1024)throw Error('Please use a file smaller than 10 MB.');
  const records=M.loadCSV(await f.text());uploaded=records;
  if(!byId('dataset').querySelector('option[value="uploaded"]')){const o=document.createElement('option');o.value='uploaded';o.textContent='Your purchasing records';byId('dataset').append(o)}
  byId('dataset').value='uploaded';options('buyer',[...new Set(records.map(r=>r.buyer))].sort());setYears();selected=null;
  byId('upload-status').textContent=`Loaded ${records.length} purchase lines from ${f.name}. Rankings describe this file only.`;render();
 }catch(err){byId('upload-status').textContent=`File not loaded: ${err.message}`;}
 e.target.value='';
};
byId('buyer').onchange=()=>{setYears();selected=null;render()};
for(const id of ['dataset','year','unit','basis'])byId(id).onchange=()=>{selected=null;render()};
byId('quantity-view').onclick=()=>{view='quantity';render()};byId('price-view').onclick=()=>{view='price';render()};
byId('contract-examples').innerHTML=CA.contract_examples.map(c=>`<article><h3>${safe(c.item)}</h3><p class="contract-value">${cad(c.contract_value_cad/c.quantity)} <small>/ ${safe(c.unit)}</small></p><p>${cad(c.contract_value_cad)} ÷ ${count(c.quantity)} planned units · ${safe(c.contract_date)}</p><p>${safe(c.note)}</p><p>${safe(c.origin)}</p>${link(c.source,'Read the contract evidence')}</article>`).join('');
for(const [id,url] of [['quantity-source',CA.sources.pspc2022],['origin-source',CA.sources.phac2022]]){byId(id).href=url;byId(id).target='_blank';byId(id).rel='noopener'}
render();
