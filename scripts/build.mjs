import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import * as pagefind from 'pagefind';

const source = 'src/pages';
async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir,e.name)) : path.join(dir,e.name)))).flat();
}
await fs.rm('docs', { recursive: true, force: true });
await fs.mkdir('docs', { recursive: true });
for (const folder of ['assets','fonts','illustrations','tool-icons']) await fs.cp(`src/${folder}`, `docs/${folder}`, { recursive: true });
await fs.copyFile('src/favicon.svg','docs/favicon.svg');
await fs.writeFile('docs/.nojekyll','');
const { index } = await pagefind.createIndex({ forceLanguage: 'zh' });
if (!index) throw Error('Search index unavailable');
function check(result) { if (result.errors?.length) throw Error(result.errors.join('\n')); }
let count=0;
try {
  for (const file of await walk(source)) {
    if (!file.endsWith('.html')) continue;
    const $=load(await fs.readFile(file,'utf8'));
    const body=$('article').length ? $('article') : $('main');
    body.attr('data-pagefind-body','');
    $('h1').first().attr('data-pagefind-meta','title');
    $('.article-next,.article-breadcrumb,.chapter-tools,.public-chapter-menu').attr('data-pagefind-ignore','');
    const rel=path.relative(source,file), html=$.html();
    await fs.mkdir(path.dirname(path.join('docs',rel)),{recursive:true});
    await fs.writeFile(path.join('docs',rel),html+'\n');
    if (rel !== 'search/index.html') check(await index.addHTMLFile({sourcePath:rel,content:html}));
    count++;
  }
  check(await index.writeFiles({outputPath:'docs/pagefind'}));
} finally { await pagefind.close(); }
console.log(`Built ${count} pages from local source. Search rebuilt without external services.`);
