# NEO CAREER 2027新卒採用サイト

ネオキャリアの新卒採用ランディングページ（デモ）です。Cloudflare Pages で静的サイトとして公開します。

## ページ構成

| パス | 内容 |
|------|------|
| `/` | LP-A: 仕事・配属（4職種紹介・比較表） |
| `/people` | LP-B: 働く社員（先輩インタビュー） |
| `/faq` | LP-C: よくある質問・募集要項・選考フロー |

## 技術スタック

- [Astro](https://astro.build/) 7.x
- Tailwind CSS 4.x
- 静的出力（SSG）

## ローカル開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

出力先: `dist/`

## Cloudflare Pages 設定

| 項目 | 値 |
|------|-----|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variable | `NODE_VERSION` = `22.12.0` |

> **Note:** Astro 7.x requires Node.js >= 22.12.0. Cloudflare Pages の環境変数 `NODE_VERSION` も `22.12.0` に設定してください。

## デプロイ

`main` ブランチへの push で Cloudflare Pages が自動ビルド・デプロイします。
