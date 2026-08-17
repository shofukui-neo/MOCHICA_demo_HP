/**
 * 回答CSVのひな形と、フォーム項目の一覧表を生成する。
 *
 *   npm run intake:template
 *
 * Google フォームを使わず、スプレッドシートに直接入力して運用することもできる。
 * その場合は生成された intake/company.csv・intake/content.csv の
 * 見出し行をそのまま使い、2行目以降を埋める。
 */
import { writeFile, mkdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMPANY_FIELDS,
  COMPANY_SECTIONS,
  CONTENT_FIELDS,
  CONTENT_ORDER_Q,
  CONTENT_TYPES,
  CONTENT_TYPE_Q,
} from './intake/fields.mjs';
import { toCsv } from './intake/util.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outDir = path.join(root, 'intake');
const force = process.argv.includes('--force');

await mkdir(outDir, { recursive: true });

const exists = async (p) => {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
};

const write = async (name, body) => {
  const file = path.join(outDir, name);
  if (!force && (await exists(file))) {
    console.log(`[intake] ${path.relative(root, file)} は既にあるので触りません（--force で上書き）。`);
    return;
  }
  await writeFile(file, body, 'utf8');
  console.log(`[intake] ${path.relative(root, file)} を書き出しました。`);
};

/* ---- CSVのひな形（見出し行のみ）---- */
await write('company.csv', toCsv([['タイムスタンプ', ...COMPANY_FIELDS.map((f) => f.q)]]));
await write(
  'content.csv',
  toCsv([['タイムスタンプ', CONTENT_TYPE_Q, CONTENT_ORDER_Q, ...CONTENT_FIELDS.map((f) => f.q)]]),
);

/* ---- 項目一覧（記入者への案内用）---- */
const typeMark = { text: '記述式', para: '段落', lines: '段落（1行1件）', image: '画像' };

const fieldRows = (fields) =>
  fields.map(
    (f) =>
      `| ${f.q} | ${typeMark[f.type]} | ${f.required ? '必須' : ''} | ${(f.help ?? '').replaceAll('|', '\\|')} |`,
  );

const doc = [
  '# 収集フォームの項目一覧',
  '',
  '`scripts/intake/fields.mjs` から自動生成されています（`npm run intake:template --force`）。',
  '',
  '## フォームA「会社基本情報」',
  '',
  '1社につき1回だけ提出します。',
  '',
  ...COMPANY_SECTIONS.flatMap((section) => [
    `### ${section.title}`,
    '',
    section.help ?? '',
    '',
    '| 質問 | 形式 | 必須 | 補足 |',
    '|------|------|------|------|',
    ...fieldRows(section.fields),
    '',
  ]),
  '## フォームB「コンテンツ登録」',
  '',
  `1件につき1回、必要な数だけ繰り返し提出します。「${CONTENT_TYPE_Q}」で入力欄が切り替わります。`,
  `「${CONTENT_ORDER_Q}」に数字を入れると並び順を指定できます（空欄なら送信順）。`,
  '',
  ...CONTENT_TYPES.flatMap((type) => [
    `### ${type.label}`,
    '',
    type.help ?? '',
    '',
    '| 質問 | 形式 | 必須 | 補足 |',
    '|------|------|------|------|',
    ...fieldRows(type.fields),
    '',
  ]),
].join('\n');

await write('fields.md', `${doc}\n`);
console.log(`[intake] 会社基本情報 ${COMPANY_FIELDS.length}問 / コンテンツ登録 ${CONTENT_FIELDS.length}問`);
