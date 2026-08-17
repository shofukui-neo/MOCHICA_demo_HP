/**
 * astro のサブコマンドを、企業を指定した状態で起動する。
 *
 * COMPANY 環境変数を astro に渡すのが目的。
 * `COMPANY=acme astro build` という書き方は PowerShell / cmd では動かないため、
 * 環境変数の設定を Node 側に寄せてどのシェルからでも同じコマンドで済むようにしている。
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { root } from './companies.mjs';

// astro の bin は package.json の exports に載っていないので、
// パッケージの場所を解決してから bin へのパスを組み立てる。
const require = createRequire(import.meta.url);
const astroBin = path.join(path.dirname(require.resolve('astro/package.json')), 'bin', 'astro.mjs');

/**
 * astro を子プロセスで実行する。企業ごとに別プロセスにすることで、
 * ビルド時に埋め込まれる COMPANY が混ざらないようにしている。
 *
 * @param {string} slug 企業 slug
 * @param {string[]} args astro に渡す引数（例: ['build']）
 * @returns {Promise<void>} 異常終了なら reject
 */
export function runAstro(slug, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [astroBin, ...args], {
      cwd: root,
      stdio: 'inherit',
      env: { ...process.env, COMPANY: slug },
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`astro ${args.join(' ')} が失敗しました（exit ${code ?? signal}）`));
    });
  });
}
