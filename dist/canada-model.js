'use strict';
(function(root){
 const headers=['row_id','product_id','item','buyer','fiscal_year','unit','quantity','net_cost_cad','manufacturing_country','source'];
 function parseCSV(text){
  text=text.replace(/^\uFEFF/,'');const rows=[];let row=[],cell='',quoted=false,closed=false;
  for(let i=0;i<text.length;i++){
   const c=text[i];
   if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++;}else{quoted=false;closed=true;}}else cell+=c;continue;}
   if(c==='"'){if(cell||closed)throw Error('Unexpected quote in CSV.');quoted=true;}
   else if(c===','||c==='\n'||c==='\r'){row.push(cell);cell='';closed=false;if(c!==','){if(row.some(x=>x.trim()))rows.push(row);row=[];if(c==='\r'&&text[i+1]==='\n')i++;}}
   else {if(closed)throw Error('Unexpected text after a closing quote.');cell+=c;}
  }
  if(quoted)throw Error('Unclosed quote in CSV.');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;
 }
 function loadCSV(text){
  const table=parseCSV(text);if(table.length<2)throw Error('Add purchasing records below the template headers.');
  const columns=table.shift().map(x=>x.trim());if(new Set(columns).size!==columns.length)throw Error('Duplicate column headers.');
  if(headers.some(h=>!columns.includes(h)))throw Error('Missing columns. Please use the purchasing template.');
  const ids=new Set(),products=new Map();
  return table.map((cells,i)=>{
   const fail=msg=>{throw Error(`Record ${i+1}: ${msg}`)};
   if(cells.length!==columns.length)fail('column count does not match the header.');
   const r=Object.fromEntries(columns.map((c,j)=>[c,cells[j].trim()]));
   for(const h of ['row_id','product_id','item','buyer','fiscal_year','unit','quantity','source'])if(!r[h])fail(`${h} is required.`);
   if(ids.has(r.row_id))fail('row_id must be unique.');ids.add(r.row_id);
   if(!['each','pair','litre'].includes(r.unit))fail('unit must be each, pair or litre; normalize packs first.');
   const numeric=/^(?:\d+(?:\.\d*)?|\.\d+)$/;
   if(!numeric.test(r.quantity))fail('quantity must be a positive number without commas.');
   r.quantity=Number(r.quantity);if(!Number.isFinite(r.quantity)||r.quantity<=0||r.quantity>Number.MAX_SAFE_INTEGER)fail('quantity is out of range.');
   if(r.unit!=='litre'&&!Number.isInteger(r.quantity))fail('each and pair quantities must be whole numbers.');
   if(r.net_cost_cad!==''){
    if(!numeric.test(r.net_cost_cad))fail('net_cost_cad must be a nonnegative CAD amount without commas.');
    r.net_cost_cad=Number(r.net_cost_cad);if(!Number.isFinite(r.net_cost_cad)||r.net_cost_cad>Number.MAX_SAFE_INTEGER)fail('net cost is out of range.');
   }else r.net_cost_cad=null;
   let url;try{url=new URL(r.source)}catch{fail('source must be a valid evidence URL.');}
   if(!['https:','http:'].includes(url.protocol))fail('source must use https:// or http://.');
   const key=r.product_id;const signature=JSON.stringify([r.item,r.unit]);
   if(products.has(key)&&products.get(key)!==signature)fail('the same product_id must have the same item name and normalized unit.');products.set(key,signature);
   const country=r.manufacturing_country.toLowerCase();
   r.manufacturing_country=['','unknown','not reported','n/a'].includes(country)?'Unknown':['canada','ca','can'].includes(country)?'Canada':r.manufacturing_country;
   return r;
  });
 }
 function aggregate(records,buyer,year,unit){
  const groups=new Map();
  for(const r of records.filter(r=>r.buyer===buyer&&r.fiscal_year===year&&r.unit===unit)){
   if(!groups.has(r.product_id))groups.set(r.product_id,{id:r.product_id,item:r.item,unit:r.unit,quantity:0,cost:0,completeCost:true,countries:new Map(),sources:new Set()});
   const g=groups.get(r.product_id);g.quantity+=r.quantity;g.cost+=r.net_cost_cad??0;g.completeCost&&=r.net_cost_cad!==null;g.sources.add(r.source);
   const key=r.manufacturing_country.toLocaleLowerCase('en');
   const country=g.countries.get(key)||{name:r.manufacturing_country,quantity:0,cost:0};country.quantity+=r.quantity;country.cost+=r.net_cost_cad??0;g.countries.set(key,country);
  }
  return [...groups.values()].map(g=>({...g,unitPrice:g.completeCost?g.cost/g.quantity:null,countries:[...g.countries.values()],sources:[...g.sources]}));
 }
 const api={parseCSV,loadCSV,aggregate};root.CanadaModel=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
