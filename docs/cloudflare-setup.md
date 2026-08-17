# Cloudflare Pages セットアップ手順

企業 × 3サブドメインで独立配信するための設定手順。

---

## 1. 全体像

**Pages プロジェクト1つ = `pages.dev` のサブドメイン1つ。**
1企業あたりサブドメインを3つに分けるので、**Pages プロジェクトは 企業数 × 3 個**になります。

```
                         GitHub リポジトリ (main)
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        ▼                                                   ▼
   企業A（slug: neo-career）                        企業B（slug: acme）
        │                                                   │
  ┌─────┼─────┐                                       ┌─────┼─────┐
  ▼     ▼     ▼                                       ▼     ▼     ▼
mochica-jobs  mochica-people  mochica-faq        acme-jobs  acme-people  acme-faq
出力:         出力:           出力:              出力:      出力:        出力:
dist-neo-career-jobs …                          dist-acme-jobs …
```

ビルドコマンドは企業ごとに `--company <slug>` を付けます。
出力ディレクトリは `dist-<slug>-<site>` です。

配信先（Pages のプロジェクト名）は設定ファイルの `origins` から導出されます。
`origins` を書き換えれば canonical・og:url・デプロイ先が同時に変わるため、
**「サイトのURLとデプロイ先がずれる」という事故が構造上起きません。**

現在の対応関係は次のコマンドで確認できます。

```bash
npm run companies
```

---

## 2. どちらの方式で配信するか

プロジェクト数が 企業数 × 3 で増えるため、企業が増えたら方式を切り替えます。

| | A. ダッシュボードで Git 連携 | B. CLI / GitHub Actions |
|---|---|---|
| 向く規模 | 1〜2社（プロジェクト3〜6個） | 3社以上 |
| push で自動デプロイ | ✅ 付く | ❌ 付かない（Actions で代替） |
| プロジェクト作成 | GUI で1つずつ | `npm run provision` で一括 |
| デプロイ | 自動 | `npm run deploy` / Actions |

> **CLI で新規作成したプロジェクトは「Direct Upload」型になり、push による自動デプロイが付きません。**
> これは Cloudflare 側の仕様で、Git 連携プロジェクトは API / wrangler からは作成できません。
> B を選ぶ場合はデプロイを GitHub Actions 側で持つことになります（8章）。

---

## 3. 方式A：ダッシュボードで Git 連携する

### 3-1. ビルド設定

企業 `neo-career` の例。**違うのは「プロジェクト名」と「ビルド出力ディレクトリ」だけ**です。

| 設定項目 | 1つ目 | 2つ目 | 3つ目 |
|---|---|---|---|
| **Project name** | `mochica-jobs` | `mochica-people` | `mochica-faq` |
| **Production branch** | `main` | `main` | `main` |
| **Framework preset** | `None` | `None` | `None` |
| **Build command** | `npm run build -- --company neo-career` | 同左 | 同左 |
| **Build output directory** | `dist-neo-career-jobs` | `dist-neo-career-people` | `dist-neo-career-faq` |
| **Root directory** | （空欄のまま） | （空欄のまま） | （空欄のまま） |

環境変数は**設定不要**です。リポジトリ直下の `.node-version`（中身は `22.12.0`）を
Cloudflare が自動で読むため、Node 22.12.0 が使われます。

### ⚠ Build output directory を必ず入力すること

**この項目を空欄のままにすると、ビルドは成功するのにサイトが 404 になります。**

空欄だとリポジトリのルートがそのまま配信され、`/package.json` や `/README.md` は見えるのに
`/` には何も無い、という状態になります。ビルド自体は正常に走っているので
ビルドログには何のエラーも出ず、原因が分かりにくい失敗です。

判別方法：デプロイURLの末尾に `/package.json` を付けて開いてみてください。
JSONが表示されたら出力ディレクトリが未設定です。

### ⚠ Framework preset は `None` にすること

`Astro` を選ぶと出力ディレクトリが `dist` で埋められます。
`dist` は3ページ全部入りの中間成果物なので、指定すると**サブドメイン分離が壊れます**
（3サイトとも同じ内容が出る）。

### 3-2. 作成手順

1. 変更を push する（Cloudflare は GitHub 上のコードを見てビルドします）

   ```bash
   git add -A
   git commit -m "feat: 複数企業対応の構成に変更"
   git push origin main
   ```

2. ダッシュボード左メニューの **Workers & Pages**（アカウントによっては **Compute (Workers)** 表記）
   → **Create** → **Pages** タブ → **Connect to Git**
3. `HP_demo` リポジトリを選択 → **Begin setup** → 3-1 の設定を入力 → **Save and Deploy**
4. 残り2つを同じ手順で作る

### 3-3. 設定を後から直す場合

1. 対象プロジェクトを開く
2. **Settings** → **Build**（または **Builds & deployments**）
3. **Build output directory** を `dist-<slug>-jobs` に変更して保存
4. **Deployments** タブ → 最新デプロイの **⋯** → **Retry deployment**（または空コミットを push）

```bash
git commit --allow-empty -m "chore: 出力ディレクトリ設定変更後の再デプロイ"
git push origin main
```

---

## 4. 方式B：CLI でまとめて作成・配信する

企業が増えたらこちら。ダッシュボードの手作業がゼロになります。

```bash
npx wrangler login                        # 初回のみ

npm run build -- --company acme           # 先にビルド（配信先の情報が作られる）
npm run provision -- --company acme       # Pages プロジェクトを3つ作成
npm run deploy -- --company acme          # ビルド + 3サイトを配信
```

全企業まとめて処理する場合：

```bash
npm run build:all
npm run provision -- --all
npm run deploy -- --all
```

作成される内容を先に確認したい場合：

```bash
npm run provision -- --all --dry-run
```

`provision` は既存プロジェクトをスキップするため、何度実行しても安全です。

### Workers 用の設定ファイルを置かないこと

リポジトリのルートに `wrangler.jsonc` / `wrangler.toml` があると
`wrangler pages deploy` がエラーになります。本リポジトリは Pages を使うため、
Workers 用の設定ファイルは置いていません。

---

## 5. デプロイ後の確認

3つのURLを開き、それぞれ**別々の内容がルートに表示される**ことを確認します。

| URL | 表示されるべき内容 |
|---|---|
| `https://mochica-jobs.pages.dev/` | 仕事を知る（事業・職種） |
| `https://mochica-people.pages.dev/` | 人を知る（VALUES・社員インタビュー） |
| `https://mochica-faq.pages.dev/` | 選考を知る（選考フロー・募集要項・FAQ） |

あわせて確認しておくとよい点：

- **`/people` や `/faq` が404になること** — 各サイトに他サイトのHTMLが混ざっていない証拠です
- **`/package.json` が404になること** — 出力ディレクトリが正しく設定されている証拠です
- **`<link rel="canonical">` が自分のURLになっていること**
- **他社の画像が含まれていないこと** — `/companies/<自社slug>/` 以外は配信物に入りません

### `<ハッシュ>.mochica-jobs.pages.dev` というURLについて

Pages はデプロイごとに `91c3165c.mochica-jobs.pages.dev` のような
**そのデプロイ専用の固定URL**を発行します。これは正常な動作です。

公開用のURLはハッシュの付かない `https://mochica-jobs.pages.dev/` です。
本番ブランチ（`main`）からのデプロイであれば、こちらも自動で最新版を指します。

---

## 6. よくある落とし穴

| 症状 | 原因 | 対処 |
|---|---|---|
| ビルドは成功するのに `/` が404 | Build output directory が空欄 | 3-3。`/package.json` が見えるかで判別できる |
| 3つとも同じ内容が出る | 出力ディレクトリが全部 `dist` になっている | `dist-<slug>-jobs` などに修正 |
| 出力ディレクトリが勝手に `dist` になる | Framework preset に `Astro` を選んだ | preset を `None` にして出力先を手入力 |
| 別の企業の内容が出る | Build command の `--company` が違う | ビルドコマンドと出力ディレクトリの slug を揃える |
| canonical が別サイトを指す | `origins` と実URLが不一致 | 設定ファイルの `origins` を実URLに合わせる |
| `未登録の企業です` でビルドが落ちる | `src/config/companies/index.ts` への登録漏れ | エラーメッセージに出る2行を追記する |
| push のたびに失敗通知が来る | 旧 Workers プロジェクトが残っている | ダッシュボードで開き **Settings** → 最下部の **Delete** |

### プロジェクト名を変更したい場合

`pages.dev` のサブドメインはプロジェクト名から決まります。名前を変えたら
設定ファイルの `origins` も必ず揃えてください。ズレると canonical と og:url が
実際のURLと食い違い、検索エンジンに誤ったURLを伝えることになります。

```ts
// src/config/companies/<slug>.config.ts
origins: {
  jobs: 'https://mochica-jobs.pages.dev',
  people: 'https://mochica-people.pages.dev',
  faq: 'https://mochica-faq.pages.dev',
},
```

`origins` を直せば `npm run deploy` の配信先も自動で追従します。

---

## 7. 独自ドメインを使う場合

`jobs.example.com` のような独自サブドメインにする手順。

1. 対象ドメインを Cloudflare のDNSに登録しておく
2. 各 Pages プロジェクト → **Custom domains** → **Set up a custom domain**
   - `mochica-jobs` に `jobs.example.com`
   - `mochica-people` に `people.example.com`
   - `mochica-faq` に `faq.example.com`
3. 設定ファイルの `origins` を独自ドメインに書き換えて push

DNSレコードは Cloudflare が自動で作成します。

> `origins` が `*.pages.dev` 以外になると、Pages のプロジェクト名を URL から導出できなくなります。
> その場合は `<slug>-<site>`（例: `acme-jobs`）が使われます。
> 既存プロジェクト名と食い違う場合は、プロジェクト名の方を `<slug>-<site>` に合わせてください。
> 対応関係は `npm run companies` で確認できます。

---

## 8. GitHub Actions から配信する

方式Bを選び、push での自動デプロイも欲しい場合。

1. Cloudflare で API トークンを発行する
   （**My Profile** → **API Tokens** → テンプレート **Edit Cloudflare Workers**、
   または Pages への編集権限を持つカスタムトークン）
2. GitHub リポジトリの **Settings** → **Secrets and variables** → **Actions** に登録する
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
3. [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) を手動実行する
   （**Actions** タブ → **Deploy** → **Run workflow** → 企業 slug を入力、または `all`）

`main` への push で自動配信したい場合は、`deploy.yml` の `on:` に
`push: { branches: [main] }` を足してください。
全企業が毎回再配信される点に注意（差分だけ配信する仕組みは入れていません）。
