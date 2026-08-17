/**
 * astro build の出力（dist/）を、サブドメインごとの独立した配信ディレクトリに分割する。
 *
 *   dist/index.html        →  dist-jobs/index.html
 *   dist/people/index.html →  dist-people/index.html
 *   dist/faq/index.html    →  dist-faq/index.html
 *
 * 各サイトは自分のオリジンのルート（`/`）に1枚だけ存在し、
 * 他サイトのHTMLは含まれない。_astro/ や favicon などの共有アセットは各出力に複製する。
 *
 * Cloudflare Pages 側は3プロジェクトとも同じビルドコマンドを実行し、
 * 「ビルド出力ディレクトリ」だけを dist-jobs / dist-people / dist-faq に振り分ける。
 */
import { cp, mkdir, rm, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = path.join(root, 'dist');

/** id: サブドメイン識別子 / page: dist からの相対パス */
const SITES = [
  { id: 'jobs', page: 'index.html' },
  { id: 'people', page: 'people/index.html' },
  { id: 'faq', page: 'faq/index.html' },
];

/**
 * ページ由来のエントリ（各サイトに1枚だけ置くHTML）。
 * これ以外の dist 直下のエントリ（_astro/ favicon.* など）は共有アセットとして全出力に複製する。
 */
const pageEntries = new Set(SITES.map((s) => s.page.split('/')[0]));

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

if (!(await exists(dist))) {
  console.error(`[split-sites] dist/ が見つかりません。先に astro build を実行してください。`);
  process.exit(1);
}

const shared = (await readdir(dist)).filter((entry) => !pageEntries.has(entry));

for (const site of SITES) {
  const src = path.join(dist, site.page);
  if (!(await exists(src))) {
    console.error(`[split-sites] ${site.page} が見つかりません。ページ構成を確認してください。`);
    process.exit(1);
  }

  const out = path.join(root, `dist-${site.id}`);
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });

  for (const entry of shared) {
    await cp(path.join(dist, entry), path.join(out, entry), { recursive: true });
  }
  await cp(src, path.join(out, 'index.html'));

  console.log(`[split-sites] dist-${site.id}/  ←  dist/${site.page}`);
}

console.log(`[split-sites] ${SITES.length} サイトを生成しました（共有アセット: ${shared.join(', ')}）`);
