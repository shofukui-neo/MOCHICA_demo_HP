/**
 * ビルドして Cloudflare Pages へ配信する。
 *
 *   npm run deploy -- --company acme          … 1社（3サイト）
 *   npm run deploy -- --all                   … 登録済みの全企業
 *   npm run deploy -- --company acme --skip-build   … ビルド済みの出力をそのまま配信
 *
 * 配信先（Pages プロジェクト名）は設定の origins から導出される。
 * origins を書き換えれば canonical・OGP・配信先が同時に変わるので、
 * 「サイトのURLとデプロイ先がずれる」という事故が起きない。
 *
 * Pages のプロジェクトが未作成なら先に npm run provision を実行すること。
 */
import { spawn } from 'node:child_process';
import path from 'node:path';
import { hasFlag, readManifest, resolveTargets, root } from './companies.mjs';
import { runAstro } from './astro-run.mjs';
import { splitSites } from './split-sites.mjs';

const skipBuild = hasFlag('skip-build');

/** wrangler を実行する（出力はそのまま流す）。 */
function wrangler(args) {
  return new Promise((resolve) => {
    const child = spawn('npx', ['wrangler', ...args], {
      cwd: root,
      shell: true, // npx / wrangler は Windows では .cmd 経由で起動する
      stdio: 'inherit',
      env: { ...process.env, CI: '1' },
    });
    child.on('error', () => resolve(1));
    child.on('exit', (code) => resolve(code ?? 1));
  });
}

const targets = await resolveTargets();
const failures = [];

for (const slug of targets) {
  console.log(`\n[deploy] ===== ${slug} =====`);

  if (!skipBuild) {
    try {
      await runAstro(slug, ['build']);
      await splitSites(slug);
    } catch (error) {
      console.error(`[deploy] ${slug} のビルドに失敗しました: ${error.message}`);
      process.exit(1);
    }
  }

  const manifest = await readManifest(slug);

  for (const site of manifest.sites) {
    console.log(`\n[deploy] ${site.dir} → ${site.project}`);
    const code = await wrangler([
      'pages',
      'deploy',
      path.join(root, site.dir),
      `--project-name=${site.project}`,
      '--branch=main',
    ]);
    if (code !== 0) failures.push(`${slug}/${site.id} (${site.project})`);
  }
}

if (failures.length > 0) {
  console.error('\n[deploy] 失敗:');
  for (const f of failures) console.error(`  - ${f}`);
  console.error('  プロジェクトが未作成の場合は npm run provision を先に実行してください。');
  process.exit(1);
}

console.log(`\n[deploy] 完了（${targets.length}社 / ${targets.length * 3}サイト）`);
