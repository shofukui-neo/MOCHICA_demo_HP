/**
 * 採用LPテンプレートの「型（スキーマ）」定義。
 *
 * このファイルはテンプレートの仕様そのものであり、企業ごとに書き換える必要はない。
 * 実際に差し込む文言・画像はすべて `src/config/site.config.ts` に記述する。
 *
 * ページ・コンポーネント側には一切の文言・画像を持たせない設計になっているため、
 * 「site.config.ts を書き換える」＝「サイトの中身がすべて入れ替わる」となる。
 */

/** 3サイトの識別子。サブドメイン・出力ディレクトリ名と対応する。 */
export type SiteId = 'jobs' | 'people' | 'faq';

/**
 * アクセントカラーのキー。実際の色は `theme.colors` で定義する。
 * カード・タグ・見出しの差し色にこのキーを指定する。
 */
export type AccentKey = 'blue' | 'green' | 'orange' | 'purple' | 'pink';

/** 画像。src は外部URL（https://…）でも public 配下の絶対パス（/images/…）でもよい。 */
export interface ImageAsset {
  src: string;
  /** 代替テキスト。装飾目的の画像は空文字 '' にする。 */
  alt: string;
}

/** リンク／ボタン。href は同一ページ内アンカー（#entry）でも外部URLでもよい。 */
export interface LinkItem {
  label: string;
  href: string;
  /** true で別タブ表示（rel="noopener noreferrer" が付く） */
  external?: boolean;
}

/** セクション共通の見出しブロック。 */
export interface SectionHeadingContent {
  /** 小さなラベル。例: '01 — Business' */
  label: string;
  /** 見出し本体 */
  title: string;
  /** 補足文。省略可 */
  lead?: string;
}

/* ============================================================
 * 全体設定（ブランド・テーマ・配信先）
 * ========================================================== */

/** 所在地。フッター表示と JSON-LD（構造化データ）の両方に使われる。 */
export interface AddressConfig {
  /** 郵便番号（ハイフンあり・〒は不要）例: '160-0023' */
  postalCode: string;
  /** 都道府県 例: '東京都' */
  region: string;
  /** 市区町村 例: '新宿区' */
  locality: string;
  /** 番地・建物名 例: '西新宿1-22-2 新宿サンエービル' */
  street: string;
  /** ISO 3166-1 の国コード 例: 'JP' */
  country: string;
}

export interface BrandConfig {
  /** サイト上の呼称。例: 'NEO CAREER' */
  name: string;
  /** 正式社名。例: '株式会社ネオキャリア' */
  company: string;
  /** 採用年度。例: '2027' */
  year: string;
  /** 採用サイトの軸となるメッセージ（PURPOSE） */
  purpose: string;
  /** ロゴ／シンボル画像。ヘッダー・フッター・JSON-LD で使う */
  logo: ImageAsset;
  address: AddressConfig;
}

/**
 * 配色。ここで指定した値が CSS 変数として上書きされ、全ページに反映される。
 * 16進数（#1a5fd0）でも rgb() でも指定できる。
 */
export interface ThemeColors {
  /** 主役の色。ボタン・セクションラベル・アクセント 'blue' に使われる */
  primary: string;
  /** primary のホバー時（少し暗い色） */
  primaryDark: string;
  /** primary の淡色。タグ背景などに使われる */
  primaryLight: string;
  /** 濃色背景。ヒーロー／PURPOSE／エントリーの背景色 */
  deep: string;
  green: string;
  greenLight: string;
  purple: string;
  purpleLight: string;
  pink: string;
  pinkLight: string;
  orange: string;
  orangeLight: string;
  /** ページ全体の下地 */
  surface: string;
  /** 一段沈んだ背景（表・引用ブロック） */
  surfaceMuted: string;
  /** 本文の文字色 */
  ink: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  /** CSS の font-family 値をそのまま書く */
  fontFamily: string;
  /** Web フォントの読み込み URL（Google Fonts 等）。不要なら省略 */
  fontUrl?: string;
  /** 事前接続しておくホスト。画像を外部配信している場合に指定すると表示が速くなる */
  preconnect?: string[];
}

/* ============================================================
 * 共通パーツ（ヘッダー・フッター・エントリー）
 * ========================================================== */

export interface HeaderConfig {
  /** ロゴ横の1行目 */
  brandName: string;
  /** ロゴ横の2行目（小さい文字） */
  brandSub: string;
  /** ロゴリンクの遷移先 */
  homeHref: string;
  /** ロゴリンクの読み上げラベル */
  homeAriaLabel: string;
  cta: LinkItem;
}

export interface FooterConfig {
  /** 会社情報の下に置く外部リンク（コーポレートサイト等）。空配列で非表示 */
  links: LinkItem[];
  /** 最下部の注記。複数行可。空配列で非表示 */
  notes: string[];
  copyright: string;
}

/** エントリーフォームの入力欄。 */
export interface EntryFormField {
  label: string;
  /** input の name 属性。実フォーム送信時に使われる */
  name: string;
  type: 'text' | 'email' | 'tel';
  placeholder: string;
  required?: boolean;
}

export interface EntryFormConfig {
  /** フォーム上部の小ラベル。例: 'DEMO FORM' / 'ENTRY' */
  badge: string;
  /** 説明文 */
  note: string;
  fields: EntryFormField[];
  submitLabel: string;
  /**
   * 送信先URL。指定すると実際に送信できるフォームになる。
   * 省略した場合は入力・送信ができないデモ表示になる。
   */
  action?: string;
  /** action 指定時の HTTP メソッド。既定は 'post' */
  method?: 'get' | 'post';
}

export interface EntryContent {
  /**
   * セクションのアンカーID。ヘッダーCTAのリンク先（header.cta.href）と揃える。
   * フォームブロックには `{id}-form` というIDが振られるので、
   * ボタンからフォームへ飛ばす場合は href に '#entry-form' のように指定する。
   */
  id: string;
  label: string;
  /** 見出し。配列の要素間はスマートフォンでのみ改行される */
  titleLines: string[];
  lead: string;
  /** 背景画像（装飾。alt は '' でよい） */
  image: ImageAsset;
  primary: LinkItem;
  secondary?: LinkItem;
  /** 省略するとフォームブロックごと非表示になる */
  form?: EntryFormConfig;
}

/* ============================================================
 * ヒーロー（全ページ共通の構造）
 * ========================================================== */

export interface HeroContent {
  /** 画像の上に出る小さなラベル */
  eyebrow: string;
  /** 大見出し。配列の1要素が1行になる */
  titleLines: string[];
  lead: string;
  image: ImageAsset;
  primary: LinkItem;
  secondary?: LinkItem;
  /** 下部に並ぶ数値。省略・空配列で非表示 */
  stats?: { value: string; label: string }[];
  /** ラベル横のドットの色。既定は primary */
  accent?: AccentKey;
}

/* ============================================================
 * 「仕事を知る」ページのセクション
 * ========================================================== */

export interface BusinessContent {
  id: string;
  heading: SectionHeadingContent;
  items: {
    /** 通し番号 例: '01' */
    no: string;
    title: string;
    /** 英語表記（小さく表示される） */
    en: string;
    image: ImageAsset;
    accent: AccentKey;
    description: string;
    /** 特徴タグ。空配列で非表示 */
    tags: string[];
  }[];
  /** セクション下部の補足。省略可 */
  note?: string;
}

export interface NumbersContent {
  id: string;
  heading: SectionHeadingContent;
  facts: {
    /** 数値部分 例: '3,486' */
    value: string;
    /** 単位 例: '名'。省略可 */
    unit?: string;
    label: string;
    /** 注記 例: 'グループ連結'。省略可 */
    note?: string;
  }[];
  image: ImageAsset;
}

export interface JobRolesContent {
  id: string;
  heading: SectionHeadingContent;
  /** 「1日の流れ」ブロックの見出し */
  dayLabel: string;
  /** 「向いている人」ブロックの見出し */
  fitLabel: string;
  items: {
    no: string;
    title: string;
    en: string;
    accent: AccentKey;
    image: ImageAsset;
    /** 職種のキャッチコピー */
    catch: string;
    body: string;
    /** 1日の流れ。空配列でブロックごと非表示 */
    day: { time: string; text: string }[];
    /** 向いている人。空配列でブロックごと非表示 */
    fit: string[];
  }[];
}

export interface ComparisonContent {
  id: string;
  heading: SectionHeadingContent;
  /** 表の左上（比較軸列）の見出し */
  axisLabel: string;
  columns: { label: string; accent: AccentKey }[];
  /** values は columns と同じ順・同じ数で並べる */
  rows: { axis: string; values: string[] }[];
}

/* ============================================================
 * 「人を知る」ページのセクション
 * ========================================================== */

export interface ValuesContent {
  id: string;
  label: string;
  /** 大見出し。PURPOSE をそのまま置くことが多い */
  title: string;
  lead: string;
  /** 背景画像（装飾） */
  image: ImageAsset;
  /** バリュー一覧の上に出る小ラベル 例: '7 VALUES' */
  itemsLabel: string;
  items: { no: string; title: string; body: string }[];
  /** 一覧の最後のマスに入る締めの言葉。1要素が1行。空配列でマスごと非表示 */
  closingLines: string[];
}

export interface InterviewContent {
  id: string;
  heading: SectionHeadingContent;
  /** 入社年の後ろに付ける語 例: '年入社' */
  joinedSuffix: string;
  /** エピソード欄の小見出し 例: 'EPISODE' */
  episodeLabel: string;
  employees: {
    name: string;
    department: string;
    /** 入社年 例: '2021' */
    joined: string;
    accent: AccentKey;
    image: ImageAsset;
    /** インタビューの見出し */
    headline: string;
    /** 社内での歩み。空配列で非表示 */
    timeline: { year: string; label: string }[];
    /** 質問と回答。2カラムで並ぶ */
    sections: { title: string; content: string }[];
    /** 印象的なエピソード。空文字で非表示 */
    episode: string;
  }[];
  /** 小カードで並べる社員一覧の見出し 例: 'OTHER MEMBERS' */
  othersLabel: string;
  /** 空配列で小カード一覧ごと非表示 */
  others: {
    name: string;
    /** カード左上のイニシャル 例: 'Y.M' */
    initials: string;
    department: string;
    joined: string;
    accent: AccentKey;
    headline: string;
  }[];
}

export interface CareerPathContent {
  id: string;
  heading: SectionHeadingContent;
  steps: { phase: string; title: string; body: string }[];
  image: ImageAsset;
}

/* ============================================================
 * 「選考を知る」ページのセクション
 * ========================================================== */

export interface SelectionFlowContent {
  id: string;
  heading: SectionHeadingContent;
  steps: { step: string; title: string; body: string }[];
}

export interface RequirementsContent {
  id: string;
  heading: SectionHeadingContent;
  items: { label: string; value: string }[];
  /** 表の下の注記。省略可 */
  note?: string;
}

export interface FaqContent {
  id: string;
  heading: SectionHeadingContent;
  /** 質問の頭に付く記号 例: 'Q.' */
  questionPrefix: string;
  /** 回答の頭に付く記号 例: 'A.' */
  answerPrefix: string;
  groups: {
    category: string;
    items: { q: string; a: string }[];
  }[];
}

/* ============================================================
 * ページ定義
 * ========================================================== */

export interface PageMeta {
  /** <title> の前半。タイトル全体は meta.titleTemplate で組み立てられる */
  title: string;
  /** meta description / og:description */
  description: string;
  /** OGP 画像のURL。SNS シェア時のサムネイル */
  ogImage: string;
}

interface PageBase {
  meta: PageMeta;
  hero: HeroContent;
  /** 共通のエントリーセクションを上書きしたい場合だけ指定する */
  entry?: EntryContent;
}

/** 仕事を知るページ。各セクションは省略すると出力されない。 */
export interface JobsPageConfig extends PageBase {
  business?: BusinessContent;
  numbers?: NumbersContent;
  jobRoles?: JobRolesContent;
  comparison?: ComparisonContent;
}

/** 人を知るページ。各セクションは省略すると出力されない。 */
export interface PeoplePageConfig extends PageBase {
  values?: ValuesContent;
  interview?: InterviewContent;
  careerPath?: CareerPathContent;
}

/** 選考を知るページ。各セクションは省略すると出力されない。 */
export interface FaqPageConfig extends PageBase {
  flow?: SelectionFlowContent;
  requirements?: RequirementsContent;
  faq?: FaqContent;
}

export interface MetaConfig {
  /** <html lang>。例: 'ja' */
  lang: string;
  /**
   * <title> の組み立て方。
   * {title} {company} {name} {year} が置換される。
   * 例: '{title} | {company} {year}年新卒採用'
   */
  titleTemplate: string;
  /** og:site_name */
  siteName: string;
  /** 本文へスキップリンクの文言（スクリーンリーダー用） */
  skipLinkLabel: string;
}

export interface SiteConfig {
  brand: BrandConfig;
  theme: ThemeConfig;
  meta: MetaConfig;
  /**
   * 3サイトの配信オリジン。canonical / og:url / JSON-LD の基準になる。
   * Cloudflare Pages のプロジェクト名とURLは必ず一致させること。
   */
  origins: Record<SiteId, string>;
  header: HeaderConfig;
  footer: FooterConfig;
  /** 3ページ共通のエントリーセクション。ページ側で上書きも可能 */
  entry: EntryContent;
  pages: {
    jobs: JobsPageConfig;
    people: PeoplePageConfig;
    faq: FaqPageConfig;
  };
}
