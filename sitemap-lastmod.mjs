// sitemap の記事URLに lastmod(updatedDate があればそれ、無ければ pubDate)を付ける。
// 記事を書き換えたこと(SEOバックフィル等)を Google に伝え、改善後の版を再クロールしてもらうため。
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const BLOG_DIR = fileURLToPath(new URL('./src/content/blog/', import.meta.url));

function loadDates() {
  const map = new Map();
  for (const f of readdirSync(BLOG_DIR)) {
    if (!f.endsWith('.md')) continue;
    const fm = readFileSync(BLOG_DIR + f, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) continue;
    const get = (k) => fm[1].match(new RegExp(`^${k}:\\s*["']?(\\d{4}-\\d{2}-\\d{2})`, 'm'))?.[1];
    const d = get('updatedDate') ?? get('pubDate');
    if (d) map.set(f.slice(0, -3), d);
  }
  return map;
}

let dates;
export function withBlogLastmod(item) {
  dates ??= loadDates();
  const m = item.url.match(/\/blog\/([^/]+)\/$/);
  if (m) {
    const d = dates.get(decodeURIComponent(m[1]));
    if (d) item.lastmod = new Date(`${d}T00:00:00+09:00`).toISOString();
  }
  return item;
}
