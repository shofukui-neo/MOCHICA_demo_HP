/**
 * astro build の出力（dist/）を、企業 × サブドメインごとの配信ディレクトリに分割する。
 *
 *   dist/index.html        →  dist-<slug>-jobs/index.html
 *   dist/people/index.html →  dist-<slug>-people/index.html
 *   dist/faq/index.html    →  dist-<slug>-faq/index.html
 *
 * 各サイトは自分のオリジンのルート（`/`）に1枚だけ存在し、
 * 他サイトのHTMLは含まれない。_astro/ や favicon などの共有アセットは各出力に複製する。
 *
 * 併せて .sites/<slug>.json に配信情報（オリジンと Pages プロジェクト名）を書き出す。
 * プロジェクト名は設定の origins から導出するので、
 * 「Pages のプロジェクト名とURLを一致させる」という約束がずれない。
 *
 * 単体で動かす場合:  node scripts/split-sites.mjs --company <slug>
 * 通常は npm run build から呼ばれる。
 */
import { cp, mkdir, rm, readdir, readFile, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import {
  IMAGE_ROOT,
  MANIFEST_ENTRY,
  SITES,
  distDir,
  manifestPath,
  resolveTargets,
  root,
} from './companies.mjs';

const dist = path.join(root, 'dist');

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

/**
 * 配信オリジンから Cloudflare Pages のプロジェクト名を導く。
 *
 *   https://mochica-jobs.pages.dev  →  mochica-jobs
 *   https://jobs.acme.co.jp         →  acme-jobs（独自ドメインは推測できないので slug から作る）
 */
function projectNameFor(origin, slug, siteId) {
  const fallback = `${slug}-${siteId}`;
  if (!origin) return fallback;
  let host;
  try {
    host = new URL(origin).hostname;
  } catch {
    return fallback;
  }
  const labels = host.split('.');
  if (labels.length >= 3 && labels.at(-2) === 'pages' && labels.at(-1) === 'dev') {
    return labels.at(-3);
  }
  return fallback;
}

/**
 * dist/ を1社ぶんの配信ディレクトリに分割する。
 * @returns {Promise<{company: string, sites: {id: string, dir: string, origin: string, project: string}[]}>}
 */
export async function splitSites(slug) {
  if (!(await exists(dist))) {
    throw new Error('dist/ が見つかりません。先に astro build を実行してください。');
  }

  const manifestFile = path.join(dist, MANIFEST_ENTRY);
  if (!(await exists(manifestFile))) {
    throw new Error(
      `dist/${MANIFEST_ENTRY} が見つかりません。src/pages/site-manifest.json.ts を消していないか確認してください。`,
    );
  }
  const manifest = JSON.parse(await readFile(manifestFile, 'utf8'));

  if (manifest.company !== slug) {
    throw new Error(
      `dist/ の中身は "${manifest.company}" のビルド結果です（"${slug}" を分割しようとしています）。\n` +
        '  企業を切り替えたときは astro build からやり直してください。',
    );
  }

  // ページ由来のエントリ（各サイトに1枚だけ置くHTML）と受け渡し用のマニフェストは
  // 共有アセットの複製対象から外す。
  const excluded = new Set([...SITES.map((s) => s.page.split('/')[0]), MANIFEST_ENTRY]);
  const shared = (await readdir(dist)).filter((entry) => !excluded.has(entry));

  const results = [];

  for (const site of SITES) {
    const src = path.join(dist, site.page);
    if (!(await exists(src))) {
      throw new Error(`${site.page} が見つかりません。ページ構成を確認してください。`);
    }

    const dir = distDir(slug, site.id);
    const out = path.join(root, dir);
    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });

    for (const entry of shared) {
      // public/companies/ には全社ぶんの画像が入っている。
      // 他社の画像を配信物に混ぜないよう、自社のフォルダだけを複製する。
      if (entry === IMAGE_ROOT) {
        const own = path.join(dist, IMAGE_ROOT, slug);
        if (await exists(own)) {
          await cp(own, path.join(out, IMAGE_ROOT, slug), { recursive: true });
        }
        continue;
      }
      await cp(path.join(dist, entry), path.join(out, entry), { recursive: true });
    }
    await cp(src, path.join(out, 'index.html'));

    const origin = manifest.origins?.[site.id] ?? '';
    results.push({
      id: site.id,
      dir,
      origin,
      project: projectNameFor(origin, slug, site.id),
    });

    console.log(`[split-sites] ${dir}/  ←  dist/${site.page}`);
  }

  const out = { company: slug, sites: results };
  const file = manifestPath(slug);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(out, null, 2)}\n`, 'utf8');

  console.log(
    `[split-sites] ${slug}: ${results.length}サイトを生成しました（共有アセット: ${shared.join(', ')}）`,
  );
  return out;
}

/* ---- 単体実行（npm run build から呼ばれる場合は関数として使う）---- */
if (process.argv[1]?.endsWith('split-sites.mjs')) {
  const [slug] = await resolveTargets({ allowAll: false });
  try {
    await splitSites(slug);
  } catch (error) {
    console.error(`[split-sites] ${error.message}`);
    process.exit(1);
  }
}
