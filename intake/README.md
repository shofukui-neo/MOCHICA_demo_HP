# intake/ — コンテンツ収集の作業ディレクトリ

Google フォームで集めた回答を置き、`src/config/site.config.ts` に変換する場所です。
運用手順は [`docs/intake-flow.md`](../docs/intake-flow.md) を参照してください。

| ファイル | 中身 | 生成元 |
|----------|------|--------|
| `create-forms.gs` | Google フォームを作る Apps Script | `npm run intake:form` |
| `company.csv` | フォームA「会社基本情報」の回答 | 回答シートからCSVダウンロード |
| `content.csv` | フォームB「コンテンツ登録」の回答 | 回答シートからCSVダウンロード |
| `fields.md` | 全質問と補足文の一覧 | `npm run intake:template` |
| `sample/` | 架空企業の記入例 | 手動 |
| `image-manifest.md` | アップロード画像の保存先一覧 | `npm run intake:build`（該当時のみ） |

```bash
npm run intake:form       # Apps Script を生成（フォーム作成用）
npm run intake:template   # CSVひな形と項目一覧を生成
npm run intake:build      # CSV → src/config/site.config.ts
```

`company.csv` / `content.csv` の見出し行はフォームの質問文と一致しています。
`--force` を付けない限り `intake:template` は既存ファイルを上書きしません。

> **個人情報の扱いに注意。** 実際の回答には社員の氏名・所属などが含まれます。
> 公開リポジトリで運用する場合は `intake/*.csv` を `.gitignore` に追加してください。
