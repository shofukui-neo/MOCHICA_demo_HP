/**
 * 企業を指定して開発サーバーを起動する。
 *
 *   npm run dev                    … 登録が1社だけならその1社
 *   npm run dev -- --company acme  … 1社だけ
 *
 * 開発中は3ページを同一オリジンの `/`・`/people`・`/faq` で確認できる。
 * サブドメイン分離が効くのはビルド後の出力（dist-<slug>-<site>/）だけ。
 *
 * 企業を切り替えるときはサーバーを停止して起動し直すこと。
 * COMPANY はビルド時に埋め込まれるため、起動後に切り替えることはできない。
 */
import { resolveTargets } from './companies.mjs';
import { runAstro } from './astro-run.mjs';

const [slug] = await resolveTargets({ allowAll: false });

// astro に渡す引数から --company とその値だけ取り除く（--host などはそのまま通す）
const passthrough = [];
for (let i = 2; i < process.argv.length; i += 1) {
  if (process.argv[i] === '--company') {
    i += 1;
    continue;
  }
  passthrough.push(process.argv[i]);
}

console.log(`[dev] ${slug} の設定で起動します。`);

try {
  await runAstro(slug, ['dev', ...passthrough]);
} catch (error) {
  console.error(`[dev] ${error.message}`);
  process.exit(1);
}
