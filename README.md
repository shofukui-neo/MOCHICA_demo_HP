# 新卒採用サイト テンプレート（MOCHICA 採用LP）

新卒採用ランディングページのテンプレート。**1リポジトリで複数企業のサイトを作れます。**

デザインは全企業で共通で、文言・画像・配色を設定ファイルから差し込みます。
ビルド時に企業を1社選ぶ方式なので、テンプレート側を直せば全企業に一度で反映されます。

1企業につき **3つの独立したサイト**を、それぞれ別サブドメインで配信します。

## サイト構成（相互リンクを持たない3サイト）

| サイト | 役割 | 固有セクション |
|--------|------|----------------|
| 仕事を知る（`jobs`） | 事業と職種を理解させる | 事業領域 / 数字で見る / 職種詳細 / 職種比較表 |
| 人を知る（`people`） | カルチャーと人で惹きつける | PURPOSE・VALUES / 社員インタビュー / キャリアパス |
| 選考を知る（`faq`） | 不安を消してエントリーさせる | 選考フロー / 募集要項 / FAQ |

各サイトは**自分のオリジンのルート（`/`）に1ページだけ**存在します。
1つのサイト内で複数画面を切り替えることはせず、画面はURL（サブドメイン）で分離されています。

**サイト間の導線は一切ありません。** ヘッダーナビ・フッターのサイトマップ・回遊カードは持たず、
各サイトは他サイトの存在を参照しません。3サイトとも末尾にエントリーセクション（`#entry`）を持ち、
単独のLPとして完結します。

title・description・canonical・og:image・JSON-LD もサイトごとに独立しているため、
それぞれが個別に検索流入・SNS流入できます。

## クイックスタート

```bash
npm install
npm run companies                       # 登録済みの企業と配信先を一覧表示
npm run dev   -- --company neo-career   # http://localhost:4321
npm run build -- --company neo-career   # dist-neo-career-{jobs,people,faq}/ に出力
```

企業が1社しか登録されていない場合は `--company` を省略できます。

## 新しい企業のサイトを作る

slug は企業の識別子です。英小文字・数字・ハイフンのみで付けます（例: `acme-foods`）。
設定ファイル名・画像フォルダ名・出力ディレクトリ名・ビルド時の指定にそのまま使われます。

### A. フォームで文章と画像を集めて自動生成する（推奨）

企業にフォームで入力してもらい、その回答から設定ファイルを生成します。
**詳細は [docs/intake-flow.md](docs/intake-flow.md) を参照してください。**

```bash
npm run intake:form                            # フォームを作る Apps Script を生成
# 企業に回答してもらい、回答シートを intake/company.csv と intake/content.csv にダウンロード

npm run intake:build -- --company acme         # CSV → src/config/companies/acme.config.ts
npm run dev -- --company acme
```

`intake:build` は設定ファイルの生成に加えて、**登録簿への追加**と
**画像フォルダ（`public/companies/acme/`）の作成**まで自動で行います。
コードを手で書く作業は発生しません。

フォームは2枚構成です。「会社基本情報」（1社1回）と「コンテンツ登録」（事業・職種・社員・FAQを1件ずつ、
必要な数だけ繰り返し提出）。通し番号・アクセント色・英字ラベル・ボタンのホバー色などは自動で補われ、
中身が1件も無いセクションは出力されません。

### B. 設定ファイルを直接書く

```bash
cp src/config/companies/_starter.config.ts src/config/companies/acme.config.ts
# src/config/companies/index.ts に import と1行を追加して登録する
# public/companies/acme/ に画像を配置し、「◯◯」を自社の文言に置き換える
npm run dev -- --company acme
```

登録を忘れた場合は、ビルド時に追記すべき2行が表示されます。

## コンテンツ・画像の管理

3ページとも **文言・画像・配色をすべて外から差し込む**構造です。
ページ（`src/pages/`）とコンポーネント（`src/components/`）に文言・画像URLは一切入っていません。

**詳細な手順は [docs/content-guide.md](docs/content-guide.md) を参照してください。**

```
src/config/
├─ schema.ts                  型定義。テンプレートの仕様そのもの（企業ごとの編集は不要）
├─ index.ts                   企業の選択・アクセント色の対応表（編集不要）
└─ companies/
   ├─ index.ts                ★ 企業の登録簿。企業追加時に1行足す
   ├─ _starter.config.ts      白紙のひな形（新規企業はこれをコピー）
   └─ <slug>.config.ts        ★ 1企業ぶんの文言・画像・配色・配信URL

public/companies/<slug>/      ★ その企業の画像
```

```
siteConfig（= <slug>.config.ts）
├─ brand        社名・呼称・採用年度・PURPOSE・ロゴ・住所
├─ theme        配色（15色）・フォント
├─ meta         lang / <title>の組み立て方 / og:site_name
├─ origins      3サイトの配信オリジン（canonical / OG / デプロイ先の基準）
├─ header       ロゴ横の表記・CTAボタン
├─ footer       外部リンク・注記・コピーライト
├─ entry        エントリーセクション（3ページ共通・末尾に配置）
└─ pages
   ├─ jobs      meta / hero / business / numbers / jobRoles / comparison
   ├─ people    meta / hero / values / interview / careerPath
   └─ faq       meta / hero / flow / requirements / faq
```

- **セクションを消す**: config のそのブロックを丸ごと削除すれば出力されません
- **件数を増減する**: 配列の要素を足し引きするだけ。レイアウトは自動で追従します
- **配色を変える**: `theme.colors` を書き換えれば全ページに反映されます
- **フォームを有効化する**: `entry.form.action` に送信先URLを指定すると実フォームになります

設定ファイルには `SiteConfig` 型が付いているため、項目名の打ち間違いや
必須項目の書き忘れはエディタ上で赤線として表示されます。
`npm run check` で全企業ぶんまとめて検査できます。

### 画像

画像は企業ごとに `public/companies/<slug>/` に置き、`/companies/<slug>/xxx.jpg` で参照します。
企業ごとにフォルダを分けているため、各社が同じファイル名を使っても衝突しません。
ビルド時は**自社のフォルダだけ**が配信物に含まれます。

推奨サイズは [docs/images.md](docs/images.md) を参照してください。

## ビルドの仕組み

`npm run build` は企業1社につき2段階です。`--all` を付けると登録済みの全企業をまわします。

1. `astro build` — `dist/` に3ページを出力（`/`・`/people`・`/faq`）
2. `scripts/split-sites.mjs` — `dist/` をサブドメインごとの配信ディレクトリに分割

```
dist/index.html        →  dist-<slug>-jobs/index.html
dist/people/index.html →  dist-<slug>-people/index.html
dist/faq/index.html    →  dist-<slug>-faq/index.html
```

`_astro/` と favicon などの共有アセットは各出力に複製されます。
分割後のディレクトリには他サイトのHTML・他社の画像は含まれません。

`dist/` は企業をまたいで使い回される中間成果物です。**配信には使わないでください。**

どの企業がどのサイトへ配信されるかは、ビルド後に `npm run companies` で確認できます。

## デプロイ

Cloudflare Pages のプロジェクト名は設定ファイルの `origins` から導出されます。
`origins` を書き換えれば canonical・og:url・デプロイ先が同時に変わるため、
URLと配信先がずれることがありません。

```bash
npx wrangler login                    # 初回のみ
npm run build -- --company acme       # 先にビルド（配信先の情報が作られる）
npm run provision -- --company acme   # Pages プロジェクトを3つ作成（何度実行しても安全）
npm run deploy -- --company acme      # ビルド + 3サイトを配信
```

**詳細な手順・ダッシュボードでの Git 連携・独自ドメイン・GitHub Actions からの配信は
[docs/cloudflare-setup.md](docs/cloudflare-setup.md) を参照してください。**

## コマンド一覧

| コマンド | 内容 |
|----------|------|
| `npm run dev -- --company <slug>` | 開発サーバー（3ページを1オリジンで確認） |
| `npm run build -- --company <slug>` | 1社ぶんビルド |
| `npm run build:all` | 登録済みの全企業をビルド |
| `npm run check` | 全企業ぶんの型チェック |
| `npm run companies` | 登録企業と配信先の一覧 |
| `npm run preview` | ビルド結果を確認 |
| `npm run intake:build -- --company <slug>` | フォーム回答（CSV）から設定を生成・登録 |
| `npm run intake:form` / `intake:html` / `intake:template` | 収集フォーム・CSVひな形の生成 |
| `npm run provision -- --company <slug>` | Pages プロジェクトを作成（`--dry-run` で確認のみ） |
| `npm run deploy -- --company <slug>` | ビルド + 配信（`--all` で全企業） |

`--company` の代わりに `--all` を渡せる場合があります（`build` / `provision` / `deploy`）。

## CI

`main` への push と PR で、[全企業ぶんの型チェックとビルド](.github/workflows/ci.yml)が走ります。
`schema.ts` やコンポーネントを直した PR で、どの企業の設定が追従できていないかをここで拾います。

## 技術スタック

- Astro 7.x（静的出力 / SSG）
- Tailwind CSS 4.x
- 追加ライブラリなし・JSは約0.3KB（ヘッダーのスクロール色反転のみ）

## 注意

同梱の `neo-career` はデモです。社員インタビュー・FAQ・募集要項は想定サンプルを含み、
画像はコーポレートサイトの公開画像を直リンクしています。
本番運用では画像を `public/companies/<slug>/` に配置して自前配信してください。
