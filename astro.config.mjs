// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

/**
 * ビルド対象の企業 slug。
 *
 * `npm run dev` / `npm run build` のラッパー（scripts/dev.mjs / scripts/build.mjs）が
 * --company の値を COMPANY 環境変数に入れて astro を起動する。
 * 空のまま渡すと src/config/index.ts が既定企業にフォールバックする。
 */
const company = process.env.COMPANY ?? '';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    // アプリ側のコードでは import.meta.env.COMPANY として読める。
    define: {
      'import.meta.env.COMPANY': JSON.stringify(company),
    },
  },
});
