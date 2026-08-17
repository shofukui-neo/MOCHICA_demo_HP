/**
 * Cloudflare Pages のプロジェクトを企業ぶんまとめて作成する。
 *
 *   npm run provision -- --company acme
 *   npm run provision -- --all
 *   npm run provision -- --company acme --dry-run   … 実行内容の確認だけ
 *
 * 1社につき jobs / people / faq の3プロジェクトを作る。
 * 企業が増えるほど手作業では回らなくなるので、最初からここを通す運用にしておく。
 *
 * プロジェクト名は設定の origins から導出される（.sites/<slug>.json を参照）。
 * そのため先に `npm run build -- --company <slug>` を済ませておくこと。
 *
 * すでに同名のプロジェクトがある場合は作成をスキップする（何度実行しても安全）。
 */
import { spawn } from 'node:child_process';
import { hasFlag, readManifest, resolveTargets, root } from './companies.mjs';

const dryRun = hasFlag('dry-run');

/** wrangler を実行して stdout を返す。失敗しても throw せず結果を返す。 */
function wrangler(args) {
  return new Promise((resolve) => {
    const child = spawn('npx', ['wrangler', ...args], {
      cwd: root,
      shell: true, // npx / wrangler は Windows では .cmd 経由で起動する
      env: { ...process.env, CI: '1' },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d));
    child.stderr.on('data', (d) => (stderr += d));
    child.on('error', (error) => resolve({ code: 1, stdout, stderr: String(error) }));
    child.on('exit', (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

const targets = await resolveTargets();

/* ---- 既存プロジェクトの一覧を取る ---- */
let existing = new Set();
if (!dryRun) {
  const list = await wrangler(['pages', 'project', 'list']);
  if (list.code !== 0) {
    console.error('[provision] Cloudflare への接続に失敗しました。');
    console.error('            npx wrangler login を実行して認証してください。');
    console.error(list.stderr.trim() || list.stdout.trim());
    process.exit(1);
  }
  // 出力は表形式。プロジェクト名らしき語をすべて拾っておく（照合にしか使わない）
  existing = new Set(list.stdout.match(/[a-z0-9][a-z0-9-]*/g) ?? []);
}

let created = 0;
let skipped = 0;
let failed = 0;

for (const slug of targets) {
  const manifest = await readManifest(slug);
  console.log(`\n[provision] ===== ${slug} =====`);

  for (const site of manifest.sites) {
    if (existing.has(site.project)) {
      console.log(`  - ${site.project} … 既存のためスキップ`);
      skipped += 1;
      continue;
    }

    if (dryRun) {
      console.log(`  - ${site.project} … 作成予定（${site.origin || 'オリジン未設定'}）`);
      continue;
    }

    const result = await wrangler([
      'pages',
      'project',
      'create',
      site.project,
      '--production-branch',
      'main',
    ]);

    if (result.code === 0) {
      console.log(`  ✓ ${site.project} を作成しました → https://${site.project}.pages.dev`);
      created += 1;
    } else if (/already exists/i.test(result.stderr + result.stdout)) {
      console.log(`  - ${site.project} … 既存のためスキップ`);
      skipped += 1;
    } else {
      console.error(`  ✗ ${site.project} の作成に失敗しました`);
      console.error(`    ${(result.stderr || result.stdout).trim().split('\n')[0]}`);
      failed += 1;
    }
  }
}

if (dryRun) {
  console.log('\n[provision] --dry-run のため何も作成していません。');
} else {
  console.log(`\n[provision] 作成 ${created} / スキップ ${skipped} / 失敗 ${failed}`);
  console.log('[provision] 続けて npm run deploy -- --company <slug> で配信できます。');
}

process.exit(failed > 0 ? 1 : 0);
