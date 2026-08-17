/**
 * 登録されている企業と、それぞれの配信先を一覧表示する。
 *
 *   npm run companies
 *
 * 配信先はビルド後にしか分からない（.sites/<slug>.json が作られる）ため、
 * まだビルドしていない企業は「未ビルド」と表示される。
 */
import { listCompanies, manifestPath, root } from './companies.mjs';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const companies = await listCompanies();

if (companies.length === 0) {
  console.log('登録されている企業がありません。');
  console.log('src/config/companies/_starter.config.ts をコピーして作成してください。');
  process.exit(0);
}

console.log(`登録企業: ${companies.length}社\n`);

for (const slug of companies) {
  console.log(`● ${slug}`);
  try {
    const manifest = JSON.parse(await readFile(manifestPath(slug), 'utf8'));
    for (const site of manifest.sites) {
      console.log(
        `    ${site.id.padEnd(7)} ${(site.origin || '(オリジン未設定)').padEnd(38)} Pages: ${site.project}`,
      );
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    console.log(`    未ビルド（npm run build -- --company ${slug}）`);
  }
  console.log('');
}

console.log(`設定ファイル: ${path.relative(root, path.join(root, 'src/config/companies'))}/`);
