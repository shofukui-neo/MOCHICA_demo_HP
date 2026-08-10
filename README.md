# NEO CAREER 2027 新卒採用サイト（MOCHICA 採用LPデモ）

株式会社ネオキャリアを題材にした新卒採用ランディングページのデモ。
Cloudflare 上で静的サイトとして配信します。

## ページ構成（完全に独立した3ページ）

| URL | ページ | 役割 | 固有セクション |
|-----|--------|------|----------------|
| `/` | 仕事を知る | 事業と職種を理解させる | 事業3領域 / 数字で見る / 4職種詳細 / 職種比較表 |
| `/people` | 人を知る | カルチャーと人で惹きつける | PURPOSE・7VALUES / 社員インタビュー / キャリアパス |
| `/faq` | 選考を知る | 不安を消してエントリーさせる | 選考フロー / 募集要項 / FAQ / エントリーフォーム |

**セクションの重複はゼロ。** 3ページはヒーロー画像・H1・title・description・canonical・og:image まで
すべて個別に持ち、単独で検索流入・SNS流入できる構成にしています。
ページ間はフッター手前の `PageNav`（相互リンクカード）で回遊させます。

## コンテンツ・画像の管理

コンテンツと画像URLは **`src/data/site.ts` に一元管理**しています。
文言差し替え・画像差し替えはこのファイルだけを触れば全ページに反映されます。

```
src/data/site.ts
├─ IMAGES        画像URL（現在は neo-career.co.jp の公開画像を直リンク）
├─ SITE          サイト共通情報・PURPOSE
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
- 追加ライブラリなし・JSは約1KB（ヘッダーのスクロール制御とモバイルメニューのみ）

## ローカル開発

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に出力
npm run preview  # ビルド結果を確認
```

## Cloudflare 設定

| 項目 | 値 |
|------|-----|
| Framework preset | Astro |
| Build command | `npm run build` |
| Build output directory | `dist` |
| 環境変数 | `NODE_VERSION` = `22.12.0` |

`main` ブランチへの push で自動ビルド・デプロイされます。

## 注意

デモサイトです。社員インタビュー・FAQ・募集要項は想定サンプルを含みます。
実際の募集内容は公式採用ページをご確認ください。
