# Cloudflare Pages セットアップ手順

3つのサブドメインで独立配信するための設定手順。

---

## 1. 全体像

**Pages プロジェクト1つ = `pages.dev` のサブドメイン1つ。**
サブドメインを3つに分けるので、Pages プロジェクトも3つ作ります。

3つとも「同じリポジトリ・同じブランチ・同じビルドコマンド」を指定します。
**違うのは「プロジェクト名」と「ビルド出力ディレクトリ」の2つだけ**です。

```
                         GitHub リポジトリ (main)
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
       Pages: mochica-jobs  Pages: mochica-people  Pages: mochica-faq
       npm run build        npm run build          npm run build
       出力: dist-jobs      出力: dist-people      出力: dist-faq
              │                   │                   │
              ▼                   ▼                   ▼
   mochica-jobs.pages.dev  mochica-people...   mochica-faq...
```

`npm run build` は3プロジェクトとも同じものが走り、`dist-jobs` `dist-people` `dist-faq`
の3つが毎回生成されます。各プロジェクトはそのうち自分の1つだけを配信します。
（他の2つは無視されるだけなので問題ありません）

---

## 2. ビルド設定（最重要）

| 設定項目 | 1つ目 | 2つ目 | 3つ目 |
|---|---|---|---|
| **Project name** | `mochica-jobs` | `mochica-people` | `mochica-faq` |
| **Production branch** | `main` | `main` | `main` |
| **Framework preset** | `None` | `None` | `None` |
| **Build command** | `npm run build` | `npm run build` | `npm run build` |
| **Build output directory** | `dist-jobs` | `dist-people` | `dist-faq` |
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
`dist` は3ページ全部入りなので、指定すると**サブドメイン分離が壊れます**
（3サイトとも同じ内容が出る）。

---

## 3. 作成手順

### 3-1. 変更を push する

Cloudflare は GitHub 上のコードを見てビルドします。ローカルの変更が push されていないと反映されません。

```bash
git add -A
git commit -m "feat: 3サイトをサブドメイン分割する構成に変更"
git push origin main
```

### 3-2. 作成画面まで

ダッシュボード左メニューの **Workers & Pages**（アカウントによっては **Compute (Workers)** 表記）
→ **Create** → **Pages** タブ → **Connect to Git**

### 3-3. リポジトリを選び、2章の表のとおり設定する

`HP_demo` リポジトリを選択 → **Begin setup** → 2章の設定を入力 → **Save and Deploy**

### 3-4. 残り2つを同じ手順で作る

### 3-5. 既存の `mochica-demo-hp` を止める

以前作成した `mochica-demo-hp`（Workers）が残っている場合は削除してください。
放置すると push のたびにビルドが走って**毎回失敗し続けます**
（Workers 用の `wrangler.jsonc` を削除したため、`wrangler deploy` が
自動セットアップ `astro add cloudflare` を実行して失敗する）。

ダッシュボードで開き、**Settings** → 最下部の **Delete**。

---

## 4. 設定を後から直す場合

既にプロジェクトを作ってしまい、出力ディレクトリだけ直したいとき。

1. 対象プロジェクトを開く
2. **Settings** → **Build**（または **Builds & deployments**）
3. **Build output directory** を `dist-jobs` に変更して保存
4. **Deployments** タブ → 最新デプロイの **⋯** → **Retry deployment**
   （または空コミットを push）

```bash
git commit --allow-empty -m "chore: 出力ディレクトリ設定変更後の再デプロイ"
git push origin main
```

---

## 5. デプロイ後の確認

3つのURLを開き、それぞれ**別々の内容がルートに表示される**ことを確認します。

| URL | 表示されるべき内容 |
|---|---|
| `https://mochica-jobs.pages.dev/` | 仕事を知る（事業3領域・4職種） |
| `https://mochica-people.pages.dev/` | 人を知る（7VALUES・社員インタビュー） |
| `https://mochica-faq.pages.dev/` | 選考を知る（選考フロー・募集要項・FAQ） |

あわせて確認しておくとよい点：

- **`/people` や `/faq` が404になること** — 各サイトに他サイトのHTMLが混ざっていない証拠です
- **`/package.json` が404になること** — 出力ディレクトリが正しく設定されている証拠です
- **`<link rel="canonical">` が自分のURLになっていること**

### `<ハッシュ>.mochica-jobs.pages.dev` というURLについて

Pages はデプロイごとに `91c3165c.mochica-jobs.pages.dev` のような
**そのデプロイ専用の固定URL**を発行します。これは正常な動作です。

公開用のURLはハッシュの付かない `https://mochica-jobs.pages.dev/` です。
本番ブランチ（`main`）からのデプロイであれば、こちらも自動で最新版を指します。

---

## 6. よくある落とし穴

| 症状 | 原因 | 対処 |
|---|---|---|
| ビルドは成功するのに `/` が404 | Build output directory が空欄 | 4章。`/package.json` が見えるかで判別できる |
| 3つとも同じ内容が出る | 出力ディレクトリが全部 `dist` になっている | 各プロジェクトを `dist-jobs` / `dist-people` / `dist-faq` に修正 |
| 出力ディレクトリが勝手に `dist` になる | Framework preset に `Astro` を選んだ | preset を `None` にして出力先を手入力 |
| ビルドは成功するが404（タイプミス系） | ディレクトリ名の誤り | `dist-jobs`（アンダースコアではなくハイフン） |
| canonical が別サイトを指す | `ORIGINS` とプロジェクト名が不一致 | `src/data/site.ts` の `ORIGINS` を実URLに合わせる |
| push のたびに失敗通知が来る | 旧 Workers プロジェクトが残っている | 3-5 を実施 |

### プロジェクト名を変更したい場合

`pages.dev` のサブドメインはプロジェクト名から決まります。名前を変えたら
`src/data/site.ts` の `ORIGINS` も必ず揃えてください。ズレると canonical と og:url が
実際のURLと食い違い、検索エンジンに誤ったURLを伝えることになります。

```ts
export const ORIGINS = {
  jobs: 'https://mochica-jobs.pages.dev',
  people: 'https://mochica-people.pages.dev',
  faq: 'https://mochica-faq.pages.dev',
} as const;
```

---

## 7. 独自ドメインを使う場合

`jobs.example.com` のような独自サブドメインにする手順。

1. 対象ドメインを Cloudflare のDNSに登録しておく
2. 各 Pages プロジェクト → **Custom domains** → **Set up a custom domain**
   - `mochica-jobs` に `jobs.example.com`
   - `mochica-people` に `people.example.com`
   - `mochica-faq` に `faq.example.com`
3. `src/data/site.ts` の `ORIGINS` を独自ドメインに書き換えて push

DNSレコードは Cloudflare が自動で作成します。

---

## 8. 補足：CLI から手動デプロイする場合

ダッシュボードを使わず、ローカルから直接デプロイすることもできます。

```bash
npx wrangler login     # 初回のみ
npm run deploy         # ビルド + 3サイトすべてデプロイ
```

個別にデプロイする場合：

```bash
npm run deploy:jobs
npm run deploy:people
npm run deploy:faq
```

> **注意：** CLI で**新規作成**したプロジェクトは「Direct Upload」型になり、
> **push による自動デプロイが付きません。** 自動デプロイが必要なら、
> 必ず3章のダッシュボード（Git連携）で作成してください。

### Workers 用の設定ファイルを置かないこと

リポジトリのルートに `wrangler.jsonc` / `wrangler.toml` があると
`wrangler pages deploy` がエラーになります。本リポジトリは Pages を使うため、
Workers 用の設定ファイルは置いていません。
