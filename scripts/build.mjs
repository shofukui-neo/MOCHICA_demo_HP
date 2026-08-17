/**
 * 企業を指定してビルドする。
 *
 *   npm run build                      … 登録が1社だけならその1社
 *   npm run build -- --company acme    … 1社だけ
 *   npm run build -- --all             … 登録済みの全企業（CI・一括デプロイ用）
 *
 * 1社につき astro build を1回まわし、その都度 dist/ を
 * dist-<slug>-jobs / dist-<slug>-people / dist-<slug>-faq に切り出す。
 * dist/ は企業をまたいで使い回される中間成果物なので、配信には使わないこと。
 */
import { resolveTargets } from './companies.mjs';
import { runAstro } from './astro-run.mjs';
import { splitSites } from './split-sites.mjs';

const targets = await resolveTargets();

console.log(`[build] 対象: ${targets.join(' / ')}（${targets.length}社）`);

const built = [];

for (const slug of targets) {
  console.log(`\n[build] ===== ${slug} =====`);
  try {
    await runAstro(slug, ['build']);
    const manifest = await splitSites(slug);
    built.push(manifest);
  } catch (error) {
    console.error(`\n[build] ${slug} のビルドに失敗しました: ${error.message}`);
    process.exit(1);
  }
}

console.log('\n[build] 完了:');
for (const m of built) {
  for (const site of m.sites) {
    console.log(`  ${site.dir.padEnd(28)} → ${site.origin || '(オリジン未設定)'}`);
  }
}
