/**
 * 設定の読み込み口。ページ・コンポーネントはここからだけ import する。
 *
 * 中身を差し替えるときに触るのは `site.config.ts` だけでよい。
 */
import type { AccentKey, AddressConfig, SiteConfig, SiteId } from './schema';
import { siteConfig } from './site.config';

export { siteConfig };
export type * from './schema';

/** 指定サイトのページ設定を取り出す。 */
export const getPage = <T extends SiteId>(id: T): SiteConfig['pages'][T] => siteConfig.pages[id];

/**
 * meta.titleTemplate のプレースホルダを埋めて <title> を組み立てる。
 * {title} {company} {name} {year} が置換される。
 */
export const formatTitle = (pageTitle: string): string =>
  siteConfig.meta.titleTemplate
    .replaceAll('{title}', pageTitle)
    .replaceAll('{company}', siteConfig.brand.company)
    .replaceAll('{name}', siteConfig.brand.name)
    .replaceAll('{year}', siteConfig.brand.year);

/** フッター表示用の住所1行。例: 〒160-0023 東京都新宿区西新宿1-22-2 新宿サンエービル */
export const formatAddress = (a: AddressConfig = siteConfig.brand.address): string =>
  `〒${a.postalCode} ${a.region}${a.locality}${a.street}`;

/**
 * theme.colors を Tailwind のテーマ変数に流し込むための対応表。
 * Layout がこの値を :root に出力するので、config の色を変えるだけで全体に反映される。
 */
export const themeCssVariables = (): string => {
  const c = siteConfig.theme.colors;
  const vars: Record<string, string> = {
    '--color-brand-blue': c.primary,
    '--color-brand-blue-dark': c.primaryDark,
    '--color-brand-blue-light': c.primaryLight,
    '--color-brand-blue-deep': c.deep,
    '--color-brand-green': c.green,
    '--color-brand-green-light': c.greenLight,
    '--color-brand-purple': c.purple,
    '--color-brand-purple-light': c.purpleLight,
    '--color-brand-pink': c.pink,
    '--color-brand-pink-light': c.pinkLight,
    '--color-brand-orange': c.orange,
    '--color-brand-orange-light': c.orangeLight,
    '--color-surface': c.surface,
    '--color-surface-muted': c.surfaceMuted,
    '--color-ink': c.ink,
    '--font-sans': siteConfig.theme.fontFamily,
  };
  return Object.entries(vars)
    .map(([key, value]) => `${key}:${value};`)
    .join('');
};

/* ------------------------------------------------------------
 * アクセントカラー → Tailwind クラスの対応表
 * AccentKey を増やしたい場合は schema.ts の型とこの4つの表に追記する。
 * ---------------------------------------------------------- */

/** 文字色 */
export const accentText: Record<AccentKey, string> = {
  blue: 'text-brand-blue',
  green: 'text-brand-green',
  orange: 'text-brand-orange',
  purple: 'text-brand-purple',
  pink: 'text-brand-pink',
};

/** 背景色（濃色・白文字と組み合わせる） */
export const accentBg: Record<AccentKey, string> = {
  blue: 'bg-brand-blue',
  green: 'bg-brand-green',
  orange: 'bg-brand-orange',
  purple: 'bg-brand-purple',
  pink: 'bg-brand-pink',
};

/** 淡色背景のみ */
export const accentBgLight: Record<AccentKey, string> = {
  blue: 'bg-brand-blue-light',
  green: 'bg-brand-green-light',
  orange: 'bg-brand-orange-light',
  purple: 'bg-brand-purple-light',
  pink: 'bg-brand-pink-light',
};

/** 淡色背景 + 同系の文字色（タグ・チップ用） */
export const accentChip: Record<AccentKey, string> = {
  blue: 'bg-brand-blue-light text-brand-blue',
  green: 'bg-brand-green-light text-brand-green',
  orange: 'bg-brand-orange-light text-brand-orange',
  purple: 'bg-brand-purple-light text-brand-purple',
  pink: 'bg-brand-pink-light text-brand-pink',
};

/** CSS 変数としてのアクセント色（インラインスタイル用） */
export const accentVar: Record<AccentKey, string> = {
  blue: 'var(--color-brand-blue)',
  green: 'var(--color-brand-green)',
  orange: 'var(--color-brand-orange)',
  purple: 'var(--color-brand-purple)',
  pink: 'var(--color-brand-pink)',
};
