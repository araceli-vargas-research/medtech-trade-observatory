'use strict';
const DATA = window.IMPORT_DATA;
const names = {'38221900':'Diagnostic & laboratory reagents','38229000':'Certified reference materials','90189060':'Electrosurgical instruments','90230000':'Demonstration apparatus & models','90273080':'Nonelectrical optical spectrometers'};
const periods = {'2025':'2025 · Full year','2025-ytd':'2025 · January–September','2026-ytd':'2026 · January–September'};
const $ = id => document.getElementById(id);
const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const compact = n => n >= 1e9 ? '$'+(n/1e9).toFixed(2)+'bn' : '$'+(n/1e6).toFixed(1)+'m';
const pct = n => n.toFixed(1)+'%';
const esc = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let code = '90189060', period = '2025';
const params = new URLSearchParams(location.hash.slice(1));
if (names[params.get('code')]) code=params.get('code');
if (periods[params.get('period')]) period=params.get('period');
$('period').value=period;
function stats(c,p){const rows=DATA.records.filter(r=>r.code===c&&r.period===p&&r.value>0).sort((a,b)=>b.value-a.value||a.country.localeCompare(b.country));const total=rows.reduce((s,r)=>s+r.value,0);const ca=rows.find(r=>r.country==='Canada');return {rows,total,canada:ca?.value||0,share:(ca?.value||0)/total*100,rank:ca?rows.indexOf(ca)+1:null,cr3:rows.slice(0,3).reduce((s,r)=>s+r.value,0)/total*100,hhi:rows.reduce((s,r)=>s+(r.value/total*100)**2,0)};}
function choose(c){code=c;render();}
function render(){
 $('category-buttons').innerHTML=Object.entries(names).map(([c,n])=>`<button class="category" data-code="${c}" aria-pressed="${c===code}"><span>${c}</span>${n}</button>`).join('');
 document.querySelectorAll('.category').forEach(b=>b.onclick=()=>choose(b.dataset.code));
 const s=stats(code,period);
 $('code').textContent='HTS '+code;$('title').textContent=names[code];$('description').textContent=DATA.descriptions[code];
 $('metrics').innerHTML=`<div class="metric"><small>U.S. imports</small><strong>${compact(s.total)}</strong><em>All source countries</em></div><div class="metric canada"><small>Imports from Canada</small><strong>${compact(s.canada)}</strong><em>${pct(s.share)} share · rank #${s.rank}</em></div><div class="metric"><small>Top 3 source countries</small><strong>${pct(s.cr3)}</strong><em>Combined import share</em></div><div class="metric"><small>Country HHI</small><strong>${Math.round(s.hhi).toLocaleString('en-US')}</strong><em>Geographic concentration</em></div>`;
 const top=s.rows.slice(0,8), max=top[0].value/s.total*100;
 $('bars').innerHTML=top.map(r=>{const share=r.value/s.total*100;return `<div class="bar-row ${r.country==='Canada'?'ca':''}" title="${esc(r.country)}: ${money(r.value)} (${pct(share)})"><span>${esc(r.country)}</span><div class="track"><div class="bar" style="width:${share/max*100}%"></div></div><span class="share">${pct(share)}</span></div>`;}).join('');
 $('bars').setAttribute('aria-label',top.map(r=>r.country+' '+pct(r.value/s.total*100)).join('; '));
 $('chart-note').textContent=`${periods[period]}. Top eight of ${s.rows.length} positive-value source countries; bar scale runs from 0 to ${pct(max)}. All other sources: ${pct(100-top.reduce((a,r)=>a+r.value,0)/s.total*100)}.`;
 const before=stats(code,'2025-ytd'),after=stats(code,'2026-ytd'),change=(after.canada/before.canada-1)*100;
 $('insight').innerHTML=`<strong>Canada, on a comparable basis.</strong> January–September imports ${change<0?'fell':'rose'} ${pct(Math.abs(change))}, from ${compact(before.canada)} in 2025 to ${compact(after.canada)} in 2026. This change alone does not establish a tariff effect.`;
 $('comparison-period').textContent=periods[period];
 $('comparison-body').innerHTML=Object.entries(names).map(([c,n])=>{const a=stats(c,period);return `<tr class="${c===code?'active':''}"><td><button data-code="${c}">${n}</button><small>${c}</small></td><td>${compact(a.total)}</td><td>${compact(a.canada)}</td><td class="ca-cell">${pct(a.share)}</td><td>${pct(a.cr3)}</td><td>${Math.round(a.hhi).toLocaleString('en-US')}</td></tr>`;}).join('');
 $('comparison-body').querySelectorAll('button').forEach(b=>b.onclick=()=>{choose(b.dataset.code);$('explore').scrollIntoView({behavior:'smooth'});});
 renderCountries();
}
function renderCountries(){const s=stats(code,period),term=$('search').value.trim().toLowerCase();let rows=s.rows.map((r,i)=>({...r,rank:i+1})).filter(r=>r.country.toLowerCase().includes(term));if($('sort').value==='name')rows.sort((a,b)=>a.country.localeCompare(b.country));$('row-count').textContent=`${rows.length} of ${s.rows.length} countries with positive imports`;$('country-caption').textContent=names[code]+' · '+periods[period];$('country-body').innerHTML=rows.length?rows.map(r=>`<tr class="${r.country==='Canada'?'ca-cell':''}"><td>${r.rank}</td><td>${esc(r.country)}</td><td>${money(r.value)}</td><td>${pct(r.value/s.total*100)}</td></tr>`).join(''):'<tr><td colspan="4">No countries match your search.</td></tr>';}
$('period').onchange=e=>{period=e.target.value;render();};$('search').oninput=renderCountries;$('sort').onchange=renderCountries;
$('export-filtered').onclick=()=>{const s=stats(code,period);const csv=['period,hts_code,country,customs_value_usd,share_percent',...s.rows.map(r=>[period,code,'"'+r.country.replaceAll('"','""')+'"',r.value,(r.value/s.total*100).toFixed(6)].join(','))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`imports-${code}-${period}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
render();
