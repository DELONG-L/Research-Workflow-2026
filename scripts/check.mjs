import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
const base='/Research-Workflow-2026';
async function walk(dir) {const entries=await fs.readdir(dir,{withFileTypes:true});return (await Promise.all(entries.map(e=>e.isDirectory()?walk(path.join(dir,e.name)):path.join(dir,e.name)))).flat();}
const pages=(await walk('docs')).filter(p=>p.endsWith('.html'));
if(pages.length!==12)throw Error(`Expected 12 public pages; got ${pages.length}`);
const forbidden=/TaskBoard|访问码|chatgpt\.site|utscyber|\/guide\/(?:taskboard|compute-resources|hpc)|\/lab\/hpc/i;
for(const file of pages){
 const text=await fs.readFile(file,'utf8');if(forbidden.test(text))throw Error(`Restricted reference: ${file}`);
 const $=load(text);
 if($('article').length){const numbers=$('.guide-sidebar a small').toArray().map(e=>$(e).text());if(numbers.join(',')!=='01,02,03,04,05,06,07,08,09')throw Error(`Wrong chapter numbering: ${file}`);}
 if(!$('title').text())throw Error(`Missing title: ${file}`);
 for(const el of $('a[href],link[href],script[src],img[src]').toArray()){
  const value=$(el).attr('href')||$(el).attr('src');
  if(/^(https?:|mailto:|data:|tel:)/.test(value))continue;
  const url=new URL(value,`https://example.test${base}/${path.relative('docs',file)}`);
  if(!url.pathname.startsWith(base+'/'))throw Error(`Wrong base path: ${file}: ${value}`);
  let target=path.join('docs',decodeURIComponent(url.pathname.slice(base.length)));
  if(!path.extname(target))target=path.join(target,'index.html');
  await fs.access(target);
  if(url.hash&&target.endsWith('.html')){
   const other=load(await fs.readFile(target,'utf8'));
   if(!other('[id]').toArray().some(e=>other(e).attr('id')===decodeURIComponent(url.hash.slice(1))))throw Error(`Missing anchor: ${file}: ${value}`);
  }
 }
}
for(const tree of ['src','docs'])for(const p of await walk(tree)){
 if(/\.(html|js|css|txt|json)$/.test(p)&&forbidden.test(await fs.readFile(p,'utf8')))throw Error(`Restricted reference in ${p}`);
}
console.log(`Validated ${pages.length} pages: links, anchors, assets and public-only content.`);
