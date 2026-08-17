/**
 * Node 側のスクリプト（build / deploy / provision / split-sites）が共有する土台。
 *
 * 企業の一覧は src/config/companies/*.config.ts のファイル名から取る。
 * `_` で始まるファイル（ひな形）は候補に含めない。
 *
 * 登録簿（src/config/companies/index.ts）に書き忘れている企業は、
 * ここでは一覧に出るがビルド時にエラーになる。どちらか一方だけ直しても
 * 気づけるように、あえて別々の情報源にしてある。
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('..', import.meta.url));

export const companiesDir = path.join(root, 'src', 'config', 'companies');

/** 企業の登録簿。 */
const registryFile = path.join(companiesDir, 'index.ts');

/** slug に使える文字。ディレクトリ名・URL・Pages プロジェクト名に流用されるため厳しめにする。 */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** 企業ごとの画像置き場の親フォルダ（public/ 直下）。 */
export const IMAGE_ROOT = 'companies';

/** 企業ごとの画像置き場（public/ からの相対）。 */
export const imageDir = (slug) => `${IMAGE_ROOT}/${slug}`;

/**
 * 3サイトの識別子と、dist からの相対パス。src/pages/ の構成と対応する。
 * ページを増やす場合はここと src/pages/ の両方に足す。
 */
export const SITES = [
  { id: 'jobs', page: 'index.html' },
  { id: 'people', page: 'people/index.html' },
  { id: 'faq', page: 'faq/index.html' },
];

/** ビルド時に astro が書き出す受け渡しファイル（配信物には含めない）。 */
export const MANIFEST_ENTRY = 'site-manifest.json';

/** 企業ごとの配信ディレクトリ名。 */
export const distDir = (slug, siteId) => `dist-${slug}-${siteId}`;

/** ビルド結果の配信情報の置き場所。.gitignore 済み。 */
export const manifestPath = (slug) => path.join(root, '.sites', `${slug}.json`);

/** src/config/companies/ にある企業 slug の一覧。 */
export async function listCompanies() {
  const files = await readdir(companiesDir);
  return files
    .filter((f) => f.endsWith('.config.ts') && !f.startsWith('_'))
    .map((f) => f.replace(/\.config\.ts$/, ''))
    .sort();
}

/** 登録簿（index.ts）に載っているか。設定ファイルの有無とは別に見る。 */
export async function isRegistered(slug) {
  const source = await readFile(registryFile, 'utf8');
  return source.includes(`from './${slug}.config'`);
}

/**
 * slug が使える状態か検証する。
 * 「設定ファイルはあるが登録簿に無い」は手で追加したときに起きやすいので、
 * astro を起動する前にここで弾いて直し方を出す。
 */
export async function assertCompany(slug) {
  const all = await listCompanies();

  if (!all.includes(slug)) {
    console.error(`[company] 設定ファイルが見つかりません: "${slug}"`);
    console.error(`          期待する場所: src/config/companies/${slug}.config.ts`);
    console.error(`          登録済み: ${all.join(' / ') || '(なし)'}`);
    process.exit(1);
  }

  if (!(await isRegistered(slug))) {
    console.error(`[company] "${slug}" が登録簿にありません。`);
    console.error(`          src/config/companies/${slug}.config.ts はありますが、`);
    console.error('          同フォルダの index.ts に登録されていないため読み込めません。');
    console.error('');
    console.error('          index.ts に次の2行を足してください:');
    console.error(`            import { siteConfig as ${identifierFor(slug)} } from './${slug}.config';`);
    console.error(`            '${slug}': ${identifierFor(slug)},`);
    process.exit(1);
  }

  return slug;
}

/** ビルド済みの配信情報を読む。 */
export async function readManifest(slug) {
  const file = manifestPath(slug);
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`[company] ${path.relative(root, file)} がありません。`);
      console.error(`          先に npm run build -- --company ${slug} を実行してください。`);
      process.exit(1);
    }
    throw error;
  }
}

/* ------------------------------------------------------------
 * 登録簿への追記
 * ---------------------------------------------------------- */

/** slug から import 用の識別子を作る。acme-foods → acmeFoods */
export const identifierFor = (slug) => {
  const camel = slug.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''));
  return /^[0-9]/.test(camel) ? `company${camel}` : camel;
};

/**
 * src/config/companies/index.ts に企業を追加する。
 * 手で追記するのを忘れると「設定ファイルはあるのにビルドできない」状態になるため、
 * 生成スクリプトからはここを必ず通す。すでに登録済みなら何もしない。
 *
 * @returns {Promise<'added' | 'already'>}
 */
export async function registerCompany(slug) {
  const source = await readFile(registryFile, 'utf8');

  if (source.includes(`from './${slug}.config'`)) return 'already';

  const ident = identifierFor(slug);
  const importLine = `import { siteConfig as ${ident} } from './${slug}.config';`;
  const entryLine = `  '${slug}': ${ident},`;

  const lines = source.split(/\r?\n/);

  // import は既存の設定 import の並びの末尾に足す（無ければ型 import の後ろ）
  let importAt = lines.findLastIndex((l) => /^import \{ siteConfig as .+ \} from '\.\/.+\.config';$/.test(l));
  if (importAt < 0) importAt = lines.findLastIndex((l) => l.startsWith('import '));
  if (importAt < 0) {
    throw new Error(`${path.relative(root, registryFile)} の import 位置が特定できません。手で追記してください。`);
  }
  lines.splice(importAt + 1, 0, importLine);

  // COMPANIES の閉じ括弧の直前に足す
  const closeAt = lines.findIndex((l) => l.startsWith('} satisfies Record<string, SiteConfig>;'));
  if (closeAt < 0) {
    throw new Error(`${path.relative(root, registryFile)} の COMPANIES が見つかりません。手で追記してください。`);
  }
  lines.splice(closeAt, 0, entryLine);

  await writeFile(registryFile, lines.join('\n'), 'utf8');
  return 'added';
}

/* ------------------------------------------------------------
 * 引数
 * ---------------------------------------------------------- */

/** `--name value` を読む。 */
export const argOf = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')
    ? process.argv[i + 1]
    : fallback;
};

/** `--name` の有無を見る。 */
export const hasFlag = (name) => process.argv.includes(`--${name}`);

/**
 * 対象の企業を決める。
 *   --all           … 登録済みの全企業
 *   --company acme  … 1社だけ
 *   （どちらも無い） … 1社しか無ければその1社、複数あれば選択を促す
 */
export async function resolveTargets({ allowAll = true } = {}) {
  const all = await listCompanies();
  if (all.length === 0) {
    console.error('[company] src/config/companies/ に企業の設定がありません。');
    process.exit(1);
  }

  // --all でも1社ずつ検証する。登録漏れの1社で全社ビルドが崩れるのを防ぐ。
  if (allowAll && hasFlag('all')) {
    for (const slug of all) await assertCompany(slug);
    return all;
  }

  const slug = argOf('company');
  if (slug) return [await assertCompany(slug)];

  if (all.length === 1) return [await assertCompany(all[0])];

  console.error('[company] 企業を指定してください。');
  console.error(`          例: -- --company ${all[0]}`);
  if (allowAll) console.error('          全社まとめて処理する場合: -- --all');
  console.error(`          登録済み: ${all.join(' / ')}`);
  process.exit(1);
}
