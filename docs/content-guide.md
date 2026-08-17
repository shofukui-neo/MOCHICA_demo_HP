# コンテンツ差し替えガイド

このテンプレートは **1企業ぶんの文言と画像を1つのファイルに集約**している。
`src/config/companies/<slug>.config.ts` を書き換えるだけで、その企業の3サイトの中身が入れ替わる。

ページ（`src/pages/`）とコンポーネント（`src/components/`）には
文言も画像URLも一切書かれていない。レイアウトやCSSに触れる必要はない。

複数企業のサイトを1つのリポジトリで持ち、ビルド時に企業を1社選ぶ方式にしている。
テンプレート側（コンポーネント・スキーマ）を直せば全企業に一度で反映される。

## ファイルの役割

| ファイル | 役割 | 企業ごとに編集するか |
|----------|------|----------------------|
| `src/config/companies/<slug>.config.ts` | **文言・画像・配色・配信URLのすべて** | ✅ ここだけ編集する |
| `src/config/companies/index.ts` | 企業の登録簿 | ✅ 企業追加時に1行足す |
| `src/config/companies/_starter.config.ts` | 白紙のひな形（コピー元） | コピーして使う |
| `src/config/schema.ts` | 型定義。各項目の意味がコメントで書かれている | ❌ 不要 |
| `src/config/index.ts` | 企業の選択・アクセント色の対応表 | ❌ 不要 |
| `src/pages/*.astro` | セクションを並べるだけ | ❌ 不要 |
| `src/components/*.astro` | 見た目のみ。props で内容を受け取る | ❌ 不要 |
| `public/companies/<slug>/` | 画像の置き場所 | ✅ 画像を置く |

推奨サイズなど画像の詳細は [`docs/images.md`](images.md) を参照。

## 新しい企業のサイトを作る手順

slug は企業の識別子。英小文字・数字・ハイフンのみで付ける（例: `acme-foods`）。
設定ファイル名・画像フォルダ名・出力ディレクトリ名にそのまま使われる。

```bash
# 1. ひな形をコピー
cp src/config/companies/_starter.config.ts src/config/companies/acme.config.ts

# 2. 登録簿に追加
#    src/config/companies/index.ts に次の2行を足す
#      import { siteConfig as acme } from './acme.config';
#      'acme': acme,

# 3. 画像を配置
#    public/companies/acme/hero-jobs.jpg などを置く

# 4. acme.config.ts の「◯◯」を自社の文言に置き換える
#    images のパスを /companies/acme/... に合わせる

# 5. 確認
npm run dev -- --company acme

# 6. 型チェックとビルド
npm run check
npm run build -- --company acme
```

フォームで文章と画像を集めて自動生成する場合は [`docs/intake-flow.md`](intake-flow.md) を参照。
そちらは手順1〜3を1コマンドで済ませられる。

## 登録済みの企業を確認する

```bash
npm run companies
```

各企業の配信先（オリジンと Cloudflare Pages のプロジェクト名）が一覧で出る。

## <slug>.config.ts の構成

```
siteConfig
├─ brand        社名・呼称・採用年度・PURPOSE・ロゴ・住所
├─ theme        配色（15色）・フォント
├─ meta         lang / <title>の組み立て方 / og:site_name
├─ origins      3サイトの配信オリジン（canonical・OGの基準）
├─ header       ロゴ横の表記・CTAボタン
├─ footer       外部リンク・注記・コピーライト
├─ entry        エントリーセクション（3ページ共通・末尾に配置）
└─ pages
   ├─ jobs      meta / hero / business / numbers / jobRoles / comparison
   ├─ people    meta / hero / values / interview / careerPath
   └─ faq       meta / hero / flow / requirements / faq
```

各項目の意味は `src/config/schema.ts` のコメントに書かれている。
エディタ上で項目名にカーソルを合わせれば説明が出る。

## よくある編集

### セクションを消す

そのブロックを丸ごと削除するだけでよい。ページから出力されなくなる。

```ts
pages: {
  jobs: {
    meta: { ... },
    hero: { ... },
    business: { ... },
    // numbers: { ... },    ← 削除すれば「数字で見る」セクションが消える
    jobRoles: { ... },
  },
}
```

ヒーローのボタンが消したセクションを指している場合は、`href` も直すこと。

### 件数を増やす／減らす

配列の要素を足し引きするだけでよい。レイアウトは自動で追従する。

- 事業（`business.items`）— 3件がきれいに並ぶが、増減しても崩れない
- 職種（`jobRoles.items`）— 画像は左右交互に自動配置される
- 社員インタビュー（`interview.employees`）— 何人でもよい
- 選考フロー（`flow.steps`）— 5件までは1行、それ以上は折り返す
- 比較表（`comparison.columns`）— 列を増やすと表の最小幅が自動で広がる

比較表だけは注意が必要で、`columns` の数と各 `rows[].values` の数を揃えること。
`values` が足りない列は空欄で表示される。

### 配色を変える

`theme.colors` を書き換えると全ページに反映される。

```ts
theme: {
  colors: {
    primary: '#c8102e',       // ボタン・見出しラベル・アクセント'blue'
    primaryDark: '#8f0b20',   // ボタンのホバー時
    primaryLight: '#fde8ea',  // タグの背景
    deep: '#1a0508',          // ヒーロー／PURPOSE／エントリーの濃色背景
    ...
  },
}
```

`deep` を変えるとヒーロー写真に被せるグラデーションも自動で追従する。

各カード・タグの差し色は `accent: 'blue' | 'green' | 'orange' | 'purple' | 'pink'` で選ぶ。
実際の色は `theme.colors` の同名の値（`blue` は `primary`）が使われる。

### エントリーフォームを実際に送信できるようにする

既定では入力・送信ができないデモ表示になっている。
`entry.form.action` に送信先URLを指定すると、入力可能な実フォームに切り替わる。

```ts
entry: {
  form: {
    badge: 'ENTRY',
    note: '下記フォームからエントリーできます。',
    action: 'https://example.com/entry',   // ← 追加すると実フォームになる
    method: 'post',                        // 省略時は post
    fields: [
      { label: 'お名前', name: 'name', type: 'text', placeholder: '山田 太郎', required: true },
      { label: 'メールアドレス', name: 'email', type: 'email', placeholder: 'taro@example.com', required: true },
    ],
    submitLabel: '送信する',
  },
}
```

`form` ごと削除すればフォームブロックが消える。

### ページごとにエントリーセクションを変える

既定では3ページとも `siteConfig.entry` を使う。
特定のページだけ変えたい場合は、そのページに `entry` を書けば上書きされる。

```ts
pages: {
  faq: {
    meta: { ... },
    hero: { ... },
    entry: { /* このページ専用のエントリーセクション */ },
  },
}
```

### 配信URLを変える

```ts
origins: {
  jobs: 'https://jobs.example.com',
  people: 'https://people.example.com',
  faq: 'https://faq.example.com',
},
```

canonical / og:url / JSON-LD のすべてに反映される。
Cloudflare Pages のプロジェクト名とURLは必ず一致させること
（`pages.dev` のサブドメインはプロジェクト名から決まる）。

## 画像の差し替え

`site.config.ts` 冒頭の `images` に集約されている。ここを書き換えれば全ページに反映される。

```ts
const images = {
  heroJobs: '/images/hero-jobs.jpg',   // public/images/ に置いたファイル
  logo: 'https://example.com/logo.png', // 外部URLでもよい
};
```

推奨サイズは [`docs/images.md`](images.md) を参照。

外部ホストから画像を配信する場合は、`theme.preconnect` にそのホストを足すと表示が速くなる。

```ts
theme: {
  preconnect: ['https://cdn.example.com'],
}
```

## 書き間違いに気づくために

`site.config.ts` は `SiteConfig` 型が付いているため、
項目名の打ち間違い・必須項目の書き忘れ・存在しないアクセント色の指定は
**エディタ上で赤線として表示される**（VS Code の Astro 拡張が必要）。

コマンドラインでも確認したい場合は型チェッカーを入れる。

```bash
npm install -D typescript @astrojs/check
npx astro check
```

`npm run build` は型を検査せずにビルドするため、
型エラーがあってもビルド自体は通る点に注意。

## 触ってはいけない場所

- `src/config/schema.ts` — 型定義。項目を増やしたいとき以外は変更しない
- `src/components/` — 見た目の定義。文言は入っていない
- `src/styles/global.css` — 色は `theme.colors` から流し込まれるので、通常は変更不要
- `scripts/split-sites.mjs` — ビルド出力を3サイトに分割する処理
