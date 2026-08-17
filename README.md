# NEO CAREER 2027 新卒採用サイト（MOCHICA 採用LPデモ）

株式会社ネオキャリアを題材にした新卒採用ランディングページのデモ。
**3つの独立したサイト**として、それぞれ別サブドメインで配信します。

## サイト構成（相互リンクを持たない3サイト）

| サブドメイン | サイト | 役割 | 固有セクション |
|--------------|--------|------|----------------|
| `mochica-jobs.pages.dev` | 仕事を知る | 事業と職種を理解させる | 事業3領域 / 数字で見る / 4職種詳細 / 職種比較表 |
| `mochica-people.pages.dev` | 人を知る | カルチャーと人で惹きつける | PURPOSE・7VALUES / 社員インタビュー / キャリアパス |
| `mochica-faq.pages.dev` | 選考を知る | 不安を消してエントリーさせる | 選考フロー / 募集要項 / FAQ |

各サイトは**自分のオリジンのルート（`/`）に1ページだけ**存在します。
1つのサイト内で複数画面を切り替えることはせず、画面はURL（サブドメイン）で分離されています。

**サイト間の導線は一切ありません。** ヘッダーナビ・フッターのサイトマップ・回遊カードは持たず、
各サイトは他サイトの存在を参照しません。3サイトとも末尾にエントリーセクション（`#entry`）を持ち、
単独のLPとして完結します。

title・description・canonical・og:image・JSON-LD もサイトごとに独立しているため、
それぞれが個別に検索流入・SNS流入できます。

### サブドメインを変更する

`src/data/site.ts` の `ORIGINS` の3行だけ書き換えれば、canonical / og:url / JSON-LD に反映されます。

```ts
export const ORIGINS = {
  jobs: 'https://mochica-jobs.pages.dev',
  people: 'https://mochica-people.pages.dev',
  faq: 'https://mochica-faq.pages.dev',
} as const;
```

独自ドメインを使う場合は `https://jobs.example.com` のように書き換え、
Cloudflare Pages 側で各プロジェクトにカスタムドメインを割り当ててください。

## ビルドの仕組み

`npm run build` は2段階です。

1. `astro build` — 従来どおり `dist/` に3ページを出力（`/`・`/people`・`/faq`）
2. `node scripts/split-sites.mjs` — `dist/` をサブドメインごとの配信ディレクトリに分割

```
dist/index.html        →  dist-jobs/index.html
dist/people/index.html →  dist-people/index.html
dist/faq/index.html    →  dist-faq/index.html
```

`_astro/` と favicon などの共有アセットは各出力に複製されます。
分割後のディレクトリには他サイトのHTMLは含まれません。

## コンテンツ・画像の管理

コンテンツと画像URLは **`src/data/site.ts` に一元管理**しています。
文言差し替え・画像差し替えはこのファイルだけを触れば全サイトに反映されます。

```
src/data/site.ts
├─ IMAGES        画像URL（現在は neo-career.co.jp の公開画像を直リンク）
├─ SITE          サイト共通情報・PURPOSE
├─ ORIGINS       3サイトの配信オリジン（canonical / OG の基準）
├─ FACTS         会社数値（創業/従業員数/売上/拠点）
├─ BUSINESSES    事業3領域
├─ JOB_ROLES     職種4種（1日の流れ・向いている人）
├─ VALUES        7 VALUES
├─ EMPLOYEES     社員インタビュー
├─ CAREER_STEPS  キャリアパス
├─ FAQS          よくある質問
├─ REQUIREMENTS  募集要項
└─ SELECTION_FLOW 選考フロー
```

### 画像をローカル配信に切り替える手順

現状はコーポレートサイトの画像を直リンクしています。本番運用では自前配信を推奨します。

1. 画像を `public/images/` に配置
2. `src/data/site.ts` の `IMAGES` の値を `/images/xxx.jpg` に変更
3. `npm run build` → push

## 技術スタック

- Astro 7.x（静的出力 / SSG）
- Tailwind CSS 4.x
- 追加ライブラリなし・JSは約0.3KB（ヘッダーのスクロール色反転のみ）

## ローカル開発

```bash
npm install
npm run dev      # http://localhost:4321 （開発時は3ページを1オリジンで確認）
npm run build    # dist-jobs/ dist-people/ dist-faq/ に出力
npm run preview  # ビルド結果を確認
```

開発サーバーでは利便性のため3ページを同一オリジンの `/`・`/people`・`/faq` で確認できます。
サブドメイン分離が効くのはビルド後の出力です。

## Cloudflare Pages 設定

**Pages プロジェクトを3つ**作成し、いずれも同じリポジトリ・同じビルドコマンドを指定します。
異なるのは「ビルド出力ディレクトリ」だけです。

| プロジェクト名 | ビルドコマンド | ビルド出力ディレクトリ |
|----------------|----------------|------------------------|
| `mochica-jobs` | `npm run build` | `dist-jobs` |
| `mochica-people` | `npm run build` | `dist-people` |
| `mochica-faq` | `npm run build` | `dist-faq` |

環境変数はいずれも `NODE_VERSION` = `22.12.0`（Astro 7.x が Node >= 22.12.0 を要求）。

`main` ブランチへの push で3プロジェクトそれぞれが自動ビルド・デプロイされます。

### CLI から手動デプロイする場合

```bash
npm run deploy         # ビルド + 3サイトすべてデプロイ
npm run deploy:jobs    # 個別デプロイ
npm run deploy:people
npm run deploy:faq
```

> **Workers ではなく Pages を使っています。** `wrangler deploy`（Workers）は wrangler 設定ファイルが
> 無いと自動セットアップ（`astro add cloudflare`）を実行し、不要な SSR アダプターを追加します。
> その結果ビルド時に Workers ランタイム（miniflare）が起動し、自動生成される `compatibility_date` が
> 同梱 workerd の対応日を追い越してビルドが失敗します。
> `wrangler pages deploy` はこの自動セットアップを行わないため、この問題は発生しません。
> リポジトリに Workers 用の `wrangler.jsonc` を置くと `pages deploy` 側がエラーになるので、置かないこと。

## 注意

デモサイトです。社員インタビュー・FAQ・募集要項は想定サンプルを含みます。
実際の募集内容は公式採用ページをご確認ください。
