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

### 配信URLを変更する

`src/config/site.config.ts` の `origins` の3行を書き換えれば、canonical / og:url / JSON-LD に
反映されます。**Pages のプロジェクト名とURLは必ず一致させてください**
（`pages.dev` のサブドメインはプロジェクト名から決まります）。

```ts
origins: {
  jobs: 'https://mochica-jobs.pages.dev',
  people: 'https://mochica-people.pages.dev',
  faq: 'https://mochica-faq.pages.dev',
},
```

独自ドメインを使う場合は `https://jobs.example.com` のように書き換え、各 Pages プロジェクトに
カスタムドメインを割り当ててください（[docs/cloudflare-setup.md](docs/cloudflare-setup.md) の7章）。

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

## コンテンツ・画像の管理（テンプレートとしての使い方）

3ページとも **文言・画像・配色をすべて外から差し込む**構造になっています。
ページ（`src/pages/`）とコンポーネント（`src/components/`）に文言・画像URLは一切入っていません。

**`src/config/site.config.ts` を書き換えるだけで、3サイトすべての中身が入れ替わります。**
どの企業でも、文章と画像さえ用意すれば同じテンプレートのサイトが作れます。

**詳細な手順は [docs/content-guide.md](docs/content-guide.md) を参照してください。**

```
src/config/
├─ site.config.ts      ★ 文言・画像・配色・配信URLのすべて（ここだけ編集する）
├─ starter.config.ts   白紙のひな形（新規企業はこれをコピーして使う）
├─ schema.ts           型定義。各項目の意味がコメントで書かれている
└─ index.ts            読み込み口・アクセント色の対応表
```

```
siteConfig
├─ brand        社名・呼称・採用年度・PURPOSE・ロゴ・住所
├─ theme        配色（15色）・フォント
├─ meta         lang / <title>の組み立て方 / og:site_name
├─ origins      3サイトの配信オリジン（canonical / OG の基準）
├─ header       ロゴ横の表記・CTAボタン
├─ footer       外部リンク・注記・コピーライト
├─ entry        エントリーセクション（3ページ共通・末尾に配置）
└─ pages
   ├─ jobs      meta / hero / business / numbers / jobRoles / comparison
   ├─ people    meta / hero / values / interview / careerPath
   └─ faq       meta / hero / flow / requirements / faq
```

### 新しい企業のサイトを作る

```bash
cp src/config/starter.config.ts src/config/site.config.ts  # ひな形をコピー
# public/images/ に画像を配置し、site.config.ts の「◯◯」を書き換える
npm run dev
```

- **セクションを消す**: config のそのブロックを丸ごと削除すれば出力されません
- **件数を増減する**: 配列の要素を足し引きするだけ。レイアウトは自動で追従します
- **配色を変える**: `theme.colors` を書き換えれば全ページに反映されます
- **フォームを有効化する**: `entry.form.action` に送信先URLを指定すると実フォームになります

`site.config.ts` には `SiteConfig` 型が付いているため、項目名の打ち間違いや
必須項目の書き忘れはエディタ上で赤線として表示されます。

### 画像をローカル配信に切り替える手順

現状はコーポレートサイトの画像を直リンクしています。本番運用では自前配信を推奨します。

1. 画像を `public/images/` に配置（推奨サイズは [docs/images.md](docs/images.md)）
2. `src/config/site.config.ts` 冒頭の `images` の値を `/images/xxx.jpg` に変更
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

**詳細な手順は [docs/cloudflare-setup.md](docs/cloudflare-setup.md) を参照してください。**

**Pages プロジェクトを3つ**作成し、いずれも同じリポジトリ・同じビルドコマンドを指定します。
異なるのはプロジェクト名とビルド出力ディレクトリだけです。

| プロジェクト名 | Framework preset | ビルドコマンド | ビルド出力ディレクトリ |
|----------------|------------------|----------------|------------------------|
| `mochica-jobs` | `None` | `npm run build` | `dist-jobs` |
| `mochica-people` | `None` | `npm run build` | `dist-people` |
| `mochica-faq` | `None` | `npm run build` | `dist-faq` |

環境変数の設定は不要です。リポジトリ直下の `.node-version`（`22.12.0`）を Cloudflare が
自動で読むため、Astro 7.x が要求する Node >= 22.12.0 が満たされます。

`main` ブランチへの push で3プロジェクトそれぞれが自動ビルド・デプロイされます。

> **ビルド出力ディレクトリを必ず入力してください。** 空欄のままだとリポジトリのルートが
> そのまま配信され、**ビルドは成功するのにサイトが404になります**。ビルドログにエラーが
> 出ないため原因が分かりにくい失敗です。デプロイURLに `/package.json` を付けて開き、
> JSONが表示されたらこの状態です。
>
> **Framework preset は `None` にしてください。** `Astro` を選ぶと出力先が `dist` で
> 埋められます。`dist` は3ページ全部入りなのでサブドメイン分離が壊れます。

### CLI から手動デプロイする場合

```bash
npm run deploy         # ビルド + 3サイトすべてデプロイ
npm run deploy:jobs    # 個別デプロイ
npm run deploy:people
npm run deploy:faq
```

> リポジトリのルートに `wrangler.jsonc` / `wrangler.toml` を置かないでください。
> `wrangler pages deploy` がエラーになります。

## 注意

デモサイトです。社員インタビュー・FAQ・募集要項は想定サンプルを含みます。
実際の募集内容は公式採用ページをご確認ください。
