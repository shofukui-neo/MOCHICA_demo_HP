/**
 * 企業の登録簿。テンプレートを使う企業はすべてここに並ぶ。
 *
 * ▼新しい企業を追加する
 *   1. 設定ファイルを用意する
 *        cp src/config/companies/_starter.config.ts src/config/companies/acme.config.ts
 *      （フォーム回答から作る場合は npm run intake:build -- --company acme）
 *   2. public/companies/acme/ に画像を置く
 *   3. このファイルに import と COMPANIES の1行を足す  ← ここだけがコード変更
 *   4. npm run dev -- --company acme で確認
 *
 * slug（COMPANIES のキー）はビルド時の --company・出力ディレクトリ名
 * （dist-<slug>-jobs など）・画像の置き場所に使われる。
 * 英小文字・数字・ハイフンのみで付けること。
 *
 * `_` で始まるファイルはひな形なので登録しない。
 */
import type { SiteConfig } from '../schema';
import { siteConfig as neoCareer } from './neo-career.config';

export const COMPANIES = {
  'neo-career': neoCareer,
} satisfies Record<string, SiteConfig>;

/** 登録済みの企業 slug。 */
export type CompanySlug = keyof typeof COMPANIES;

/** --company を省略したときに使う企業。 */
export const DEFAULT_COMPANY: CompanySlug = 'neo-career';
