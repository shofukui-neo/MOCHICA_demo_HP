/**
 * 収集した回答（CSV） → src/config/site.config.ts を生成する。
 *
 *   npm run intake:build
 *   npm run intake:build -- --out src/config/site.config.preview.ts   # 別名で出力
 *   npm run intake:build -- --dir path/to/csv                          # 入力先を変える
 *
 * 入力
 *   intake/company.csv   フォームA「会社基本情報」の回答（1行だけ使う）
 *   intake/content.csv   フォームB「コンテンツ登録」の回答（何行でも可）
 *
 * Google フォームの回答シートから「ファイル > ダウンロード > カンマ区切り形式」で
 * 書き出したものをそのまま置けばよい（タイムスタンプ等の余分な列は無視される）。
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildConfig, renderConfigSource } from './intake/build.mjs';
import { parseCsv, toRecords } from './intake/util.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));

const argOf = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const inputDir = path.resolve(root, argOf('dir', 'intake'));
const outFile = path.resolve(root, argOf('out', 'src/config/site.config.ts'));
const manifestFile = path.join(inputDir, 'image-manifest.md');

const readCsv = async (name) => {
  const file = path.join(inputDir, name);
  try {
    return toRecords(parseCsv(await readFile(file, 'utf8')));
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`[intake] ${path.relative(root, file)} が見つかりません。`);
      console.error('         npm run intake:template でひな形を作れます。');
      process.exit(1);
    }
    throw error;
  }
};

const company = await readCsv('company.csv');
const content = await readCsv('content.csv');

if (company.records.length === 0) {
  console.error('[intake] company.csv に回答がありません。');
  process.exit(1);
}
if (company.records.length > 1) {
  console.warn(
    `[intake] company.csv に回答が${company.records.length}件あります。最後の行（最新の回答）を使います。`,
  );
}

const { config, images, issues } = buildConfig({
  companyRecord: company.records[company.records.length - 1],
  contentRecords: content.records,
});

/* ---- 見つからなかった列 ---- */
if (issues.missingColumns.size > 0) {
  console.warn(`\n[intake] CSVに見つからなかった列が ${issues.missingColumns.size} 件あります:`);
  for (const q of issues.missingColumns) console.warn(`  - ${q}`);
  console.warn('  フォームの質問文を変更した場合は scripts/intake/fields.mjs の q も合わせてください。');
}

/* ---- 警告 ---- */
if (issues.warnings.length > 0) {
  console.warn('\n[intake] 警告:');
  for (const w of issues.warnings) console.warn(`  - ${w}`);
}

/* ---- エラー（未入力の必須項目など）---- */
if (issues.errors.length > 0) {
  console.error('\n[intake] エラー:');
  for (const e of issues.errors) console.error(`  - ${e}`);
  console.error('\n  修正してから再実行してください。');
  process.exit(1);
}

/* ---- 出力 ---- */
await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, renderConfigSource(config, images), 'utf8');
console.log(`\n[intake] ${path.relative(root, outFile)} を生成しました。`);

/* ---- 画像の保存先一覧（Drive アップロードを使った場合）---- */
if (issues.downloads.length > 0) {
  const lines = [
    '# 画像の保存先',
    '',
    'フォームでアップロードされた画像は Google ドライブに保存されています。',
    '下記のとおりダウンロードして `public/images/` に置いてください。',
    '',
    '| 用途 | ドライブ上のURL | 保存先 |',
    '|------|------------------|--------|',
    ...issues.downloads.map((d) => `| ${d.label} | ${d.from} | \`${d.to}\` |`),
    '',
  ];
  await writeFile(manifestFile, lines.join('\n'), 'utf8');
  console.log(
    `[intake] アップロード画像が ${issues.downloads.length} 件あります。` +
      `保存先を ${path.relative(root, manifestFile)} に書き出しました。`,
  );
}

/* ---- サマリ ---- */
const count = (section) => (section ? Object.keys(section).length && true : false);
console.log('[intake] 生成された内容:');
console.log(`  事業: ${config.pages.jobs.business?.items.length ?? 0}件`);
console.log(`  職種: ${config.pages.jobs.jobRoles?.items.length ?? 0}件`);
console.log(`  比較表: ${count(config.pages.jobs.comparison) ? `${config.pages.jobs.comparison.rows.length}行` : 'なし'}`);
console.log(`  バリュー: ${config.pages.people.values?.items.length ?? 0}件`);
console.log(`  社員インタビュー: ${config.pages.people.interview?.employees.length ?? 0}名`);
console.log(`  社員小カード: ${config.pages.people.interview?.others.length ?? 0}名`);
console.log(`  選考フロー: ${config.pages.faq.flow?.steps.length ?? 0}段`);
console.log(`  募集要項: ${config.pages.faq.requirements?.items.length ?? 0}項目`);
console.log(
  `  FAQ: ${config.pages.faq.faq?.groups.reduce((n, g) => n + g.items.length, 0) ?? 0}問` +
    ` / ${config.pages.faq.faq?.groups.length ?? 0}カテゴリ`,
);
console.log('\n  npm run dev で確認してください。');
