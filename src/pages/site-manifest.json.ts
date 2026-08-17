import type { APIRoute } from 'astro';
import { companySlug, siteConfig } from '../config';

/**
 * ビルド情報を Node 側のスクリプトに渡すための出力。
 *
 * デプロイ先（Cloudflare Pages のプロジェクト名）は origins から決まるが、
 * origins は TypeScript の設定ファイルの中にあるため .mjs のスクリプトからは読めない。
 * そこでビルド時に dist/site-manifest.json として書き出し、
 * scripts/split-sites.mjs がこれを読んで .sites/<slug>.json にまとめ直す。
 *
 * ★ このファイルは配信対象には含まれない。
 *   split-sites.mjs が dist-<slug>-<site>/ へコピーする際に除外している。
 */
export const GET: APIRoute = () =>
  Response.json({
    company: companySlug,
    origins: siteConfig.origins,
  });
