/**
 * 採用LPのコンテンツ収集フォームを作成する Apps Script。
 *
 * ■ 使い方
 *   1. https://script.google.com/ を開き「新しいプロジェクト」を作る
 *   2. エディタの中身を全部消して、このファイルの中身をすべて貼り付ける
 *   3. 上部の関数選択で createForms を選び「実行」
 *   4. 初回は権限の承認を求められる
 *      「このアプリは確認されていません」と出たら
 *      → 詳細 → （プロジェクト名）に移動（安全ではないページ）→ 許可
 *      （自分で作ったスクリプトなので問題ありません）
 *   5. 実行ログに出るURLを回答者に共有する
 *      URLは回答スプレッドシートの「フォームURL」タブにも記録されます
 *
 * ■ 作られるもの
 *   - フォームA「会社基本情報」  71問（7セクション）／1社1回だけ回答
 *   - フォームB「コンテンツ登録」30問（種別で分岐）／1件ごとに繰り返し回答
 *   - 回答スプレッドシート1つ（両フォームの回答が別タブに入る）
 *
 * ■ 注意
 *   - このファイルは npm run intake:form で自動生成されています。
 *     質問文を変えたい場合は scripts/intake/fields.mjs を直して再生成してください。
 *     フォーム画面で質問文を直接編集すると回答シートの列見出しが変わり、
 *     npm run intake:build が読めなくなります。
 *   - 画像の質問は記述式（公開URL または ファイル名）で作られます。
 *     ファイルのアップロードにしたい場合は、作成後にフォーム編集画面で
 *     該当の質問を「ファイルのアップロード」に変更してください。
 *     質問文を変えなければ、そのまま npm run intake:build で読めます。
 *     ※アップロードは回答者に Google アカウントのログインを要求します。
 *   - createForms を2回実行すると、フォームとスプレッドシートがもう1組できます。
 *     作り直したい場合は、先に古いものをドライブから削除してください。
 */

var SPEC = {
  "spreadsheetTitle": "採用LP コンテンツ収集（回答）",
  "company": {
    "title": "採用LP コンテンツ収集｜会社基本情報",
    "description": "採用サイトに載せる文章と画像をうかがいます。1社につき1回だけご回答ください。\n各項目に入力例を添えていますので参考にしてください。\n送信後に届く「回答を編集」リンクから、あとで直すこともできます。",
    "confirmation": "ご回答ありがとうございました。\nこの画面の「回答を編集」リンクから、あとから内容を修正できます。",
    "sections": [
      {
        "title": "1. 会社の基本情報",
        "help": "サイト全体のヘッダー・フッター・構造化データに使われます。",
        "fields": [
          {
            "q": "会社名（正式名称）",
            "help": "例: 株式会社ネオキャリア",
            "type": "text",
            "required": true
          },
          {
            "q": "サイト上の呼称",
            "help": "ロゴ横に出る表記。例: NEO CAREER",
            "type": "text",
            "required": true
          },
          {
            "q": "採用年度",
            "help": "例: 2027",
            "type": "text",
            "required": true
          },
          {
            "q": "PURPOSE（採用サイトの軸になる一文）",
            "help": "例: 人と本気で向き合い、未来を切り拓く。",
            "type": "text",
            "required": true
          },
          {
            "q": "郵便番号",
            "help": "ハイフンあり。例: 160-0023",
            "type": "text",
            "required": false
          },
          {
            "q": "都道府県",
            "help": "例: 東京都",
            "type": "text",
            "required": false
          },
          {
            "q": "市区町村",
            "help": "例: 新宿区",
            "type": "text",
            "required": false
          },
          {
            "q": "番地・建物名",
            "help": "例: 西新宿1-22-2 新宿サンエービル",
            "type": "text",
            "required": false
          },
          {
            "q": "コーポレートサイトのURL",
            "help": "フッターからリンクします。不要なら空欄。",
            "type": "text",
            "required": false
          },
          {
            "q": "コピーライト表記",
            "help": "例: © neo career",
            "type": "text",
            "required": false
          }
        ]
      },
      {
        "title": "2. デザイン",
        "help": "ブランドカラーは16進数（#から始まる6桁）で入力してください。ボタンのホバー色とタグの淡色は自動生成されます。",
        "fields": [
          {
            "q": "メインカラー",
            "help": "ボタン・見出しラベルの色。例: #1a5fd0",
            "type": "text",
            "required": false
          },
          {
            "q": "濃色背景の色",
            "help": "ヒーロー／PURPOSE／エントリーの背景。例: #0a1f3d",
            "type": "text",
            "required": false
          },
          {
            "q": "ロゴ／シンボル画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          }
        ]
      },
      {
        "title": "3. 配信URL",
        "help": "3サイトはそれぞれ別のURLで配信されます。canonical・OGP・構造化データの基準になります。",
        "fields": [
          {
            "q": "「仕事を知る」サイトのURL",
            "help": "例: https://example-jobs.pages.dev",
            "type": "text",
            "required": false
          },
          {
            "q": "「人を知る」サイトのURL",
            "help": "例: https://example-people.pages.dev",
            "type": "text",
            "required": false
          },
          {
            "q": "「選考を知る」サイトのURL",
            "help": "例: https://example-faq.pages.dev",
            "type": "text",
            "required": false
          }
        ]
      },
      {
        "title": "4. 「仕事を知る」ページ",
        "help": "事業と職種を紹介するページです。事業と職種の中身は別フォーム「コンテンツ登録」で1件ずつ登録します。",
        "fields": [
          {
            "q": "【仕事】ページの説明文",
            "help": "検索結果とSNSシェアに出る説明文。120文字程度。",
            "type": "para",
            "required": true
          },
          {
            "q": "【仕事】ヒーローの見出し",
            "help": "1行に1件ずつ、改行区切りで入力してください。2行程度を推奨します。",
            "type": "lines",
            "required": true
          },
          {
            "q": "【仕事】ヒーローのリード文",
            "help": "このページで何が分かるかを2〜3行で。",
            "type": "para",
            "required": true
          },
          {
            "q": "【仕事】ヒーロー画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          },
          {
            "q": "【仕事】ヒーロー画像の説明",
            "help": "目の不自由な方向けの代替テキスト。例: ◯◯で働く社員",
            "type": "text",
            "required": false
          },
          {
            "q": "【仕事】ヒーローに並べる数字",
            "help": "1行に「値 | ラベル」の形式で、改行区切りで入力してください。4件を推奨。例: 3領域 | 事業ドメイン",
            "type": "lines",
            "required": false
          },
          {
            "q": "【仕事】事業セクションの見出し",
            "help": "例: 結局、何をやっている会社？",
            "type": "text",
            "required": false
          },
          {
            "q": "【仕事】事業セクションのリード文",
            "help": "",
            "type": "para",
            "required": false
          },
          {
            "q": "【仕事】事業セクションの補足",
            "help": "セクション下部の小さな一文。不要なら空欄。",
            "type": "para",
            "required": false
          },
          {
            "q": "【仕事】数字セクションの見出し",
            "help": "例: 数字で見る◯◯",
            "type": "text",
            "required": false
          },
          {
            "q": "【仕事】数字セクションのリード文",
            "help": "",
            "type": "para",
            "required": false
          },
          {
            "q": "【仕事】会社の数字",
            "help": "1行に「値 | 単位 | ラベル | 注記」の形式で、改行区切りで入力してください。4件を推奨。例: 3,486 | 名 | 従業員数 | グループ連結",
            "type": "lines",
            "required": false
          },
          {
            "q": "【仕事】数字セクションの画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          },
          {
            "q": "【仕事】数字セクションの画像の説明",
            "help": "例: ◯◯のオフィス",
            "type": "text",
            "required": false
          },
          {
            "q": "【仕事】職種セクションの見出し",
            "help": "例: 4つの職種、4つの未来",
            "type": "text",
            "required": false
          },
          {
            "q": "【仕事】職種セクションのリード文",
            "help": "",
            "type": "para",
            "required": false
          },
          {
            "q": "【仕事】比較表の見出し",
            "help": "例: 職種を横に並べて比べる。比較表が不要なら空欄。",
            "type": "text",
            "required": false
          },
          {
            "q": "【仕事】比較表のリード文",
            "help": "",
            "type": "para",
            "required": false
          },
          {
            "q": "【仕事】比較表の中身",
            "help": "1行に「比較軸 | 職種1の値 | 職種2の値 | …」の形式で入力してください。職種の順番は「コンテンツ登録」フォームで登録した順に合わせます。例: 向き合う相手 | 企業の人事 | 求職者本人",
            "type": "lines",
            "required": false
          }
        ]
      },
      {
        "title": "5. 「人を知る」ページ",
        "help": "価値観と社員を紹介するページです。社員インタビューは別フォーム「コンテンツ登録」で1名ずつ登録します。",
        "fields": [
          {
            "q": "【人】ページの説明文",
            "help": "120文字程度。",
            "type": "para",
            "required": true
          },
          {
            "q": "【人】ヒーローの見出し",
            "help": "1行に1件ずつ、改行区切りで入力してください。2行程度を推奨します。",
            "type": "lines",
            "required": true
          },
          {
            "q": "【人】ヒーローのリード文",
            "help": "",
            "type": "para",
            "required": true
          },
          {
            "q": "【人】ヒーロー画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          },
          {
            "q": "【人】ヒーロー画像の説明",
            "help": "",
            "type": "text",
            "required": false
          },
          {
            "q": "【人】ヒーローに並べる数字",
            "help": "1行に「値 | ラベル」の形式で、改行区切りで入力してください。4件を推奨。例: 31.0歳 | 平均年齢",
            "type": "lines",
            "required": false
          },
          {
            "q": "【人】PURPOSEセクションの見出し",
            "help": "空欄ならPURPOSEがそのまま入ります。",
            "type": "text",
            "required": false
          },
          {
            "q": "【人】PURPOSEセクションのリード文",
            "help": "目指す姿を2〜3行で。",
            "type": "para",
            "required": false
          },
          {
            "q": "【人】バリュー一覧の小ラベル",
            "help": "例: 7 VALUES",
            "type": "text",
            "required": false
          },
          {
            "q": "【人】バリュー一覧",
            "help": "1行に「タイトル | 本文」の形式で、改行区切りで入力してください。例: ぜんぶ自分ゴト化 | 強いオーナーシップをもって取り組もう。",
            "type": "lines",
            "required": false
          },
          {
            "q": "【人】バリュー一覧の締めの言葉",
            "help": "1行に1件ずつ、改行区切りで入力してください。一覧の最後のマスに入ります。不要なら空欄。",
            "type": "lines",
            "required": false
          },
          {
            "q": "【人】PURPOSEセクションの背景画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          },
          {
            "q": "【人】インタビューセクションの見出し",
            "help": "例: 先輩社員の、加工しない話",
            "type": "text",
            "required": false
          },
          {
            "q": "【人】インタビューセクションのリード文",
            "help": "",
            "type": "para",
            "required": false
          },
          {
            "q": "【人】キャリアパスの見出し",
            "help": "例: 入社してからの、現実的な話。不要なら空欄。",
            "type": "text",
            "required": false
          },
          {
            "q": "【人】キャリアパスのリード文",
            "help": "",
            "type": "para",
            "required": false
          },
          {
            "q": "【人】キャリアパスのステップ",
            "help": "1行に「時期 | タイトル | 本文」の形式で、改行区切りで入力してください。例: 1年目 | 徹底的に基礎を作る | 3ヶ月の新人研修後に配属。",
            "type": "lines",
            "required": false
          },
          {
            "q": "【人】キャリアパスの画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          },
          {
            "q": "【人】キャリアパスの画像の説明",
            "help": "",
            "type": "text",
            "required": false
          }
        ]
      },
      {
        "title": "6. 「選考を知る」ページ",
        "help": "選考フロー・募集要項・FAQのページです。FAQの中身は別フォーム「コンテンツ登録」で1問ずつ登録します。",
        "fields": [
          {
            "q": "【選考】ページの説明文",
            "help": "120文字程度。",
            "type": "para",
            "required": true
          },
          {
            "q": "【選考】ヒーローの見出し",
            "help": "1行に1件ずつ、改行区切りで入力してください。2行程度を推奨します。",
            "type": "lines",
            "required": true
          },
          {
            "q": "【選考】ヒーローのリード文",
            "help": "",
            "type": "para",
            "required": true
          },
          {
            "q": "【選考】ヒーロー画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          },
          {
            "q": "【選考】ヒーロー画像の説明",
            "help": "",
            "type": "text",
            "required": false
          },
          {
            "q": "【選考】ヒーローに並べる数字",
            "help": "1行に「値 | ラベル」の形式で、改行区切りで入力してください。4件を推奨。例: 通年 | エントリー受付",
            "type": "lines",
            "required": false
          },
          {
            "q": "【選考】選考フローの見出し",
            "help": "例: エントリーから内定まで",
            "type": "text",
            "required": false
          },
          {
            "q": "【選考】選考フローのリード文",
            "help": "",
            "type": "para",
            "required": false
          },
          {
            "q": "【選考】選考フローのステップ",
            "help": "1行に「ステップ名 | 説明」の形式で、改行区切りで入力してください。5件までは横1列に並びます。例: エントリー | フォームから1分で完了。",
            "type": "lines",
            "required": false
          },
          {
            "q": "【選考】募集要項",
            "help": "1行に「項目名 | 内容」の形式で、改行区切りで入力してください。例: 勤務地 | 新宿本社ほか全国60拠点以上",
            "type": "lines",
            "required": false
          },
          {
            "q": "【選考】募集要項の注記",
            "help": "表の下に出る小さな一文。不要なら空欄。",
            "type": "para",
            "required": false
          },
          {
            "q": "【選考】FAQセクションの見出し",
            "help": "例: 聞きにくいことも、全部答えます",
            "type": "text",
            "required": false
          },
          {
            "q": "【選考】FAQセクションのリード文",
            "help": "",
            "type": "para",
            "required": false
          }
        ]
      },
      {
        "title": "7. エントリーセクション",
        "help": "3ページ共通で末尾に入るエントリー導線です。",
        "fields": [
          {
            "q": "【エントリー】見出し",
            "help": "1行に1件ずつ、改行区切りで入力してください。2行程度を推奨します。",
            "type": "lines",
            "required": false
          },
          {
            "q": "【エントリー】リード文",
            "help": "",
            "type": "para",
            "required": false
          },
          {
            "q": "【エントリー】背景画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          },
          {
            "q": "【エントリー】フォームの説明文",
            "help": "フォーム上部に出る案内文。",
            "type": "para",
            "required": false
          }
        ]
      }
    ]
  },
  "content": {
    "title": "採用LP コンテンツ収集｜コンテンツ登録",
    "description": "事業・職種・社員・よくある質問を1件ずつご登録ください。\n件数の制限はありません。1件登録するごとに送信し、続けて次の1件を登録してください。",
    "confirmation": "1件登録しました。\n続けて登録する場合は下の「別の回答を送信」からどうぞ。",
    "typeQuestion": "登録する内容",
    "typeHelp": "登録したい内容を選ぶと、それに応じた入力欄が表示されます。",
    "orderQuestion": "表示順",
    "orderHelp": "表示したい順番を数字で入力してください（1が先頭）。空欄の場合は送信順になります。",
    "types": [
      {
        "label": "事業",
        "help": "「仕事を知る」ページの事業カードになります。3件程度を推奨します。",
        "fields": [
          {
            "q": "【事業】事業名",
            "help": "例: 採用支援",
            "type": "text",
            "required": true
          },
          {
            "q": "【事業】英語表記",
            "help": "カード内に小さく出ます。例: Recruitment",
            "type": "text",
            "required": true
          },
          {
            "q": "【事業】説明文",
            "help": "3行程度で。",
            "type": "para",
            "required": true
          },
          {
            "q": "【事業】特徴タグ",
            "help": "1行に1件ずつ、改行区切りで入力してください。3件程度を推奨。例: RPO",
            "type": "lines",
            "required": false
          },
          {
            "q": "【事業】画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          }
        ]
      },
      {
        "label": "職種",
        "help": "「仕事を知る」ページの職種カードになります。登録した順が比較表の列の順になります。",
        "fields": [
          {
            "q": "【職種】職種名",
            "help": "例: 法人営業",
            "type": "text",
            "required": true
          },
          {
            "q": "【職種】英語表記",
            "help": "例: B2B Sales",
            "type": "text",
            "required": true
          },
          {
            "q": "【職種】キャッチコピー",
            "help": "例: 企業の採用課題を、根っこから解く。",
            "type": "text",
            "required": true
          },
          {
            "q": "【職種】仕事内容",
            "help": "3行程度で。",
            "type": "para",
            "required": true
          },
          {
            "q": "【職種】1日の流れ",
            "help": "1行に「時刻 | 内容」の形式で、改行区切りで入力してください。例: 09:30 | チーム朝会・当日の商談準備",
            "type": "lines",
            "required": false
          },
          {
            "q": "【職種】向いている人",
            "help": "1行に1件ずつ、改行区切りで入力してください。3件程度を推奨。例: 人と話すのが好き",
            "type": "lines",
            "required": false
          },
          {
            "q": "【職種】画像",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          }
        ]
      },
      {
        "label": "社員インタビュー",
        "help": "「人を知る」ページの大きなインタビューカードになります。",
        "fields": [
          {
            "q": "【社員】氏名",
            "help": "例: 田中 花子",
            "type": "text",
            "required": true
          },
          {
            "q": "【社員】所属部署",
            "help": "例: 法人営業部",
            "type": "text",
            "required": true
          },
          {
            "q": "【社員】入社年",
            "help": "西暦4桁。例: 2021",
            "type": "text",
            "required": true
          },
          {
            "q": "【社員】インタビューの見出し",
            "help": "1文で。例: 入社2年目でチームリーダーへ。",
            "type": "para",
            "required": true
          },
          {
            "q": "【社員】社内での歩み",
            "help": "1行に「年 | 出来事」の形式で、改行区切りで入力してください。例: 2021 | 入社・法人営業配属",
            "type": "lines",
            "required": false
          },
          {
            "q": "【社員】質問と回答",
            "help": "1行に「質問 | 回答」の形式で、改行区切りで入力してください。4件を推奨。例: 入社理由 | ミッションに共感しました。",
            "type": "lines",
            "required": false
          },
          {
            "q": "【社員】印象的なエピソード",
            "help": "3行程度で。不要なら空欄。",
            "type": "para",
            "required": false
          },
          {
            "q": "【社員】写真",
            "help": "画像の公開URL、または public/images/ に置くファイル名（例: hero-jobs.jpg）を入力してください。",
            "type": "image",
            "required": false
          }
        ]
      },
      {
        "label": "社員（小カード）",
        "help": "「人を知る」ページ下部に並ぶ小さいカードです。インタビューより手軽に人数を出せます。",
        "fields": [
          {
            "q": "【小カード】氏名",
            "help": "例: 山田 美咲",
            "type": "text",
            "required": true
          },
          {
            "q": "【小カード】イニシャル",
            "help": "カード左上に出ます。例: Y.M",
            "type": "text",
            "required": true
          },
          {
            "q": "【小カード】所属部署",
            "help": "例: 新規事業開発部",
            "type": "text",
            "required": true
          },
          {
            "q": "【小カード】入社年",
            "help": "西暦4桁。例: 2022",
            "type": "text",
            "required": true
          },
          {
            "q": "【小カード】ひとこと",
            "help": "1文で。例: 3年目で新規事業を立ち上げ",
            "type": "para",
            "required": true
          }
        ]
      },
      {
        "label": "よくある質問",
        "help": "「選考を知る」ページのFAQです。同じカテゴリ名を付けた質問がひとまとまりで表示されます。",
        "fields": [
          {
            "q": "【FAQ】カテゴリ",
            "help": "例: 選考について / 働き方について",
            "type": "text",
            "required": true
          },
          {
            "q": "【FAQ】質問",
            "help": "",
            "type": "text",
            "required": true
          },
          {
            "q": "【FAQ】回答",
            "help": "",
            "type": "para",
            "required": true
          }
        ]
      }
    ]
  }
};

/** メイン。これを実行する。 */
function createForms() {
  var ss = SpreadsheetApp.create(SPEC.spreadsheetTitle);
  ss.getSheets()[0].setName('フォームURL');

  var companyForm = buildCompanyForm();
  var contentForm = buildContentForm();

  companyForm.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  contentForm.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // URLを見失わないようスプレッドシートにも書いておく
  var table = [
    ['フォーム', '回答用URL（回答者に共有する）', '編集用URL（自分用）'],
    ['会社基本情報', companyForm.getPublishedUrl(), companyForm.getEditUrl()],
    ['コンテンツ登録', contentForm.getPublishedUrl(), contentForm.getEditUrl()],
  ];
  var sheet = ss.getSheetByName('フォームURL');
  sheet.getRange(1, 1, table.length, 3).setValues(table);
  sheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  sheet.setColumnWidth(2, 420);
  sheet.setColumnWidth(3, 420);

  var lines = [
    '',
    '=== 作成が完了しました ===',
    '',
    '回答スプレッドシート:',
    '  ' + ss.getUrl(),
    '',
    '【フォームA 会社基本情報】1社1回だけ回答してもらう',
    '  回答用: ' + companyForm.getPublishedUrl(),
    '  編集用: ' + companyForm.getEditUrl(),
    '',
    '【フォームB コンテンツ登録】事業・職種・社員・FAQを1件ずつ繰り返し回答してもらう',
    '  回答用: ' + contentForm.getPublishedUrl(),
    '  編集用: ' + contentForm.getEditUrl(),
    '',
    '回答が集まったら、スプレッドシートの各タブを',
    'ファイル > ダウンロード > カンマ区切り形式 で書き出し、',
    'intake/company.csv と intake/content.csv として保存してください。',
    '',
  ];
  Logger.log(lines.join('\n'));
  return lines.join('\n');
}

/** フォームA：会社基本情報（セクションを順に進む） */
function buildCompanyForm() {
  var form = FormApp.create(SPEC.company.title);
  applyCommonSettings(form);
  form.setDescription(SPEC.company.description);
  form.setConfirmationMessage(SPEC.company.confirmation);

  for (var i = 0; i < SPEC.company.sections.length; i++) {
    var section = SPEC.company.sections[i];
    var header;
    if (i === 0) {
      header = form.addSectionHeaderItem();
    } else {
      header = form.addPageBreakItem();
    }
    header.setTitle(section.title);
    if (section.help) {
      header.setHelpText(section.help);
    }
    for (var j = 0; j < section.fields.length; j++) {
      addField(form, section.fields[j]);
    }
  }
  return form;
}

/** フォームB：コンテンツ登録（種別で入力欄が分岐する） */
function buildContentForm() {
  var form = FormApp.create(SPEC.content.title);
  applyCommonSettings(form);
  form.setDescription(SPEC.content.description);
  form.setConfirmationMessage(SPEC.content.confirmation);
  // 1件送信したあと、続けて次の1件を登録できるようにする
  form.setShowLinkToRespondAgain(true);

  var typeItem = form.addMultipleChoiceItem()
    .setTitle(SPEC.content.typeQuestion)
    .setHelpText(SPEC.content.typeHelp)
    .setRequired(true);

  form.addTextItem()
    .setTitle(SPEC.content.orderQuestion)
    .setHelpText(SPEC.content.orderHelp);

  // 種別ごとに1ページずつ用意する
  var pages = [];
  for (var i = 0; i < SPEC.content.types.length; i++) {
    var type = SPEC.content.types[i];
    var page = form.addPageBreakItem().setTitle(type.label);
    if (type.help) {
      page.setHelpText(type.help);
    }
    pages.push(page);

    for (var j = 0; j < type.fields.length; j++) {
      addField(form, type.fields[j]);
    }
  }

  // 各ページを回答し終えたら、次の種別に進まずそのまま送信させる。
  // setGoToPage は「このページ区切りの直前のページを終えたあとの遷移先」を決めるため、
  // 2つ目以降のページ区切りに SUBMIT を設定すると、1つ前の種別ページが送信で終わる。
  // 最後の種別ページは後続のページ区切りが無いので、そのまま送信になる。
  for (var k = 1; k < pages.length; k++) {
    pages[k].setGoToPage(FormApp.PageNavigationType.SUBMIT);
  }

  // 選んだ種別のページへ飛ばす
  var choices = [];
  for (var m = 0; m < SPEC.content.types.length; m++) {
    choices.push(typeItem.createChoice(SPEC.content.types[m].label, pages[m]));
  }
  typeItem.setChoices(choices);

  return form;
}

/**
 * 両フォーム共通の設定。
 * Google Workspace のアカウントで作ると、既定で「組織内のユーザーのみ回答可」に
 * なることがある。社外の企業に配るので、ログイン不要・メール収集なしにしておく。
 * 個人アカウントではこれらの設定が存在せず例外になるため、個別に握りつぶす。
 */
function applyCommonSettings(form) {
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);
  form.setAcceptingResponses(true);

  try {
    form.setRequireLogin(false);
  } catch (e) {
    Logger.log('setRequireLogin はこのアカウントでは設定できませんでした: ' + e);
  }
  try {
    form.setCollectEmail(false);
  } catch (e) {
    Logger.log('setCollectEmail はこのアカウントでは設定できませんでした: ' + e);
  }
}

/** 1項目をフォームに追加する */
function addField(form, field) {
  var item;
  if (field.type === 'para' || field.type === 'lines') {
    item = form.addParagraphTextItem();
  } else {
    item = form.addTextItem();
  }
  item.setTitle(field.q);
  if (field.help) {
    item.setHelpText(field.help);
  }
  item.setRequired(field.required);
  return item;
}
