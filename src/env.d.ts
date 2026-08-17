/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * ビルド対象の企業 slug。
   * astro.config.mjs が COMPANY 環境変数の値を埋め込む（未指定なら空文字）。
   */
  readonly COMPANY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
