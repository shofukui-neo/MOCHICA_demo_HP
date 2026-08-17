/**
 * 収集フォームの項目定義（唯一の真実）。
 *
 * このファイルから次の3つが生成・駆動される。
 *   - Google フォームを自動作成する Apps Script                  … scripts/make-form-script.mjs
 *   - 手入力用のCSVテンプレート                                   … scripts/make-intake-template.mjs
 *   - 回答CSV → src/config/companies/<slug>.config.ts の変換      … scripts/generate-config.mjs
 *
 * ★ 質問文（q）がそのまま回答シートの列見出しになる。
 *   フォーム作成後に質問文を編集した場合は、このファイルの q も必ず合わせること。
 *
 * type の意味
 *   text   … 単一行の記述式
 *   para   … 段落（長文）
 *   lines  … 段落。1行が1件。parts があれば「 | 」区切りで分解する
 *   image  … 画像。公開URL、または public/images/ に置くファイル名を入力する
 *            （フォーム側を「ファイルのアップロード」に差し替えてもよい。
 *             その場合は Drive のURLが入るので、生成時に保存先の一覧が出力される）
 */

/** 画像項目の共通ヘルプ */
const IMAGE_HELP =
  '画像の公開URL、またはファイル名（例: hero-jobs.jpg）を入力してください。' +
  'ファイル名で指定した場合は public/companies/<企業slug>/ に置きます。';

/** lines型のヘルプ文を parts から自動生成する */
export const linesHelp = (parts, extra = '') => {
  const format = parts ? `1行に「${parts.map((p) => p.label).join(' | ')}」の形式で` : '1行に1件ずつ';
  return `${format}、改行区切りで入力してください。${extra}`;
};

const img = (q, path) => ({ q, path, type: 'image', help: IMAGE_HELP });

/* ============================================================
 * フォームA「会社基本情報」— 1社につき1回だけ提出する
 * ========================================================== */

export const COMPANY_SECTIONS = [
  {
    title: '1. 会社の基本情報',
    help: 'サイト全体のヘッダー・フッター・構造化データに使われます。',
    fields: [
      { q: '会社名（正式名称）', path: 'brand.company', type: 'text', required: true, help: '例: 株式会社ネオキャリア' },
      { q: 'サイト上の呼称', path: 'brand.name', type: 'text', required: true, help: 'ロゴ横に出る表記。例: NEO CAREER' },
      { q: '採用年度', path: 'brand.year', type: 'text', required: true, help: '例: 2027' },
      { q: 'PURPOSE（採用サイトの軸になる一文）', path: 'brand.purpose', type: 'text', required: true, help: '例: 人と本気で向き合い、未来を切り拓く。' },
      { q: '郵便番号', path: 'brand.address.postalCode', type: 'text', help: 'ハイフンあり。例: 160-0023' },
      { q: '都道府県', path: 'brand.address.region', type: 'text', help: '例: 東京都' },
      { q: '市区町村', path: 'brand.address.locality', type: 'text', help: '例: 新宿区' },
      { q: '番地・建物名', path: 'brand.address.street', type: 'text', help: '例: 西新宿1-22-2 新宿サンエービル' },
      { q: 'コーポレートサイトのURL', path: '$.corporateUrl', type: 'text', help: 'フッターからリンクします。不要なら空欄。' },
      { q: 'コピーライト表記', path: 'footer.copyright', type: 'text', help: '例: © neo career' },
    ],
  },
  {
    title: '2. デザイン',
    help: 'ブランドカラーは16進数（#から始まる6桁）で入力してください。ボタンのホバー色とタグの淡色は自動生成されます。',
    fields: [
      { q: 'メインカラー', path: 'theme.colors.primary', type: 'text', help: 'ボタン・見出しラベルの色。例: #1a5fd0' },
      { q: '濃色背景の色', path: 'theme.colors.deep', type: 'text', help: 'ヒーロー／PURPOSE／エントリーの背景。例: #0a1f3d' },
      img('ロゴ／シンボル画像', 'brand.logo.src'),
    ],
  },
  {
    title: '3. 配信URL',
    help: '3サイトはそれぞれ別のURLで配信されます。canonical・OGP・構造化データの基準になります。',
    fields: [
      { q: '「仕事を知る」サイトのURL', path: 'origins.jobs', type: 'text', help: '例: https://example-jobs.pages.dev' },
      { q: '「人を知る」サイトのURL', path: 'origins.people', type: 'text', help: '例: https://example-people.pages.dev' },
      { q: '「選考を知る」サイトのURL', path: 'origins.faq', type: 'text', help: '例: https://example-faq.pages.dev' },
    ],
  },
  {
    title: '4. 「仕事を知る」ページ',
    help: '事業と職種を紹介するページです。事業と職種の中身は別フォーム「コンテンツ登録」で1件ずつ登録します。',
    fields: [
      { q: '【仕事】ページの説明文', path: 'pages.jobs.meta.description', type: 'para', required: true, help: '検索結果とSNSシェアに出る説明文。120文字程度。' },
      { q: '【仕事】ヒーローの見出し', path: 'pages.jobs.hero.titleLines', type: 'lines', required: true, help: linesHelp(null, '2行程度を推奨します。') },
      { q: '【仕事】ヒーローのリード文', path: 'pages.jobs.hero.lead', type: 'para', required: true, help: 'このページで何が分かるかを2〜3行で。' },
      img('【仕事】ヒーロー画像', 'pages.jobs.hero.image.src'),
      { q: '【仕事】ヒーロー画像の説明', path: 'pages.jobs.hero.image.alt', type: 'text', help: '目の不自由な方向けの代替テキスト。例: ◯◯で働く社員' },
      {
        q: '【仕事】ヒーローに並べる数字',
        path: 'pages.jobs.hero.stats',
        type: 'lines',
        parts: [{ key: 'value', label: '値' }, { key: 'label', label: 'ラベル' }],
        help: linesHelp([{ label: '値' }, { label: 'ラベル' }], '4件を推奨。例: 3領域 | 事業ドメイン'),
      },
      { q: '【仕事】事業セクションの見出し', path: 'pages.jobs.business.heading.title', type: 'text', help: '例: 結局、何をやっている会社？' },
      { q: '【仕事】事業セクションのリード文', path: 'pages.jobs.business.heading.lead', type: 'para' },
      { q: '【仕事】事業セクションの補足', path: 'pages.jobs.business.note', type: 'para', help: 'セクション下部の小さな一文。不要なら空欄。' },
      { q: '【仕事】数字セクションの見出し', path: 'pages.jobs.numbers.heading.title', type: 'text', help: '例: 数字で見る◯◯' },
      { q: '【仕事】数字セクションのリード文', path: 'pages.jobs.numbers.heading.lead', type: 'para' },
      {
        q: '【仕事】会社の数字',
        path: 'pages.jobs.numbers.facts',
        type: 'lines',
        parts: [
          { key: 'value', label: '値' },
          { key: 'unit', label: '単位' },
          { key: 'label', label: 'ラベル' },
          { key: 'note', label: '注記' },
        ],
        help: linesHelp(
          [{ label: '値' }, { label: '単位' }, { label: 'ラベル' }, { label: '注記' }],
          '4件を推奨。例: 3,486 | 名 | 従業員数 | グループ連結',
        ),
      },
      img('【仕事】数字セクションの画像', 'pages.jobs.numbers.image.src'),
      { q: '【仕事】数字セクションの画像の説明', path: 'pages.jobs.numbers.image.alt', type: 'text', help: '例: ◯◯のオフィス' },
      { q: '【仕事】職種セクションの見出し', path: 'pages.jobs.jobRoles.heading.title', type: 'text', help: '例: 4つの職種、4つの未来' },
      { q: '【仕事】職種セクションのリード文', path: 'pages.jobs.jobRoles.heading.lead', type: 'para' },
      { q: '【仕事】比較表の見出し', path: 'pages.jobs.comparison.heading.title', type: 'text', help: '例: 職種を横に並べて比べる。比較表が不要なら空欄。' },
      { q: '【仕事】比較表のリード文', path: 'pages.jobs.comparison.heading.lead', type: 'para' },
      {
        q: '【仕事】比較表の中身',
        path: 'pages.jobs.comparison.rows',
        type: 'lines',
        parts: [{ key: 'axis', label: '比較軸' }, { key: 'values', label: '職種ごとの値', rest: true }],
        help: '1行に「比較軸 | 職種1の値 | 職種2の値 | …」の形式で入力してください。職種の順番は「コンテンツ登録」フォームで登録した順に合わせます。例: 向き合う相手 | 企業の人事 | 求職者本人',
      },
    ],
  },
  {
    title: '5. 「人を知る」ページ',
    help: '価値観と社員を紹介するページです。社員インタビューは別フォーム「コンテンツ登録」で1名ずつ登録します。',
    fields: [
      { q: '【人】ページの説明文', path: 'pages.people.meta.description', type: 'para', required: true, help: '120文字程度。' },
      { q: '【人】ヒーローの見出し', path: 'pages.people.hero.titleLines', type: 'lines', required: true, help: linesHelp(null, '2行程度を推奨します。') },
      { q: '【人】ヒーローのリード文', path: 'pages.people.hero.lead', type: 'para', required: true },
      img('【人】ヒーロー画像', 'pages.people.hero.image.src'),
      { q: '【人】ヒーロー画像の説明', path: 'pages.people.hero.image.alt', type: 'text' },
      {
        q: '【人】ヒーローに並べる数字',
        path: 'pages.people.hero.stats',
        type: 'lines',
        parts: [{ key: 'value', label: '値' }, { key: 'label', label: 'ラベル' }],
        help: linesHelp([{ label: '値' }, { label: 'ラベル' }], '4件を推奨。例: 31.0歳 | 平均年齢'),
      },
      { q: '【人】PURPOSEセクションの見出し', path: 'pages.people.values.title', type: 'text', help: '空欄ならPURPOSEがそのまま入ります。' },
      { q: '【人】PURPOSEセクションのリード文', path: 'pages.people.values.lead', type: 'para', help: '目指す姿を2〜3行で。' },
      { q: '【人】バリュー一覧の小ラベル', path: 'pages.people.values.itemsLabel', type: 'text', help: '例: 7 VALUES' },
      {
        q: '【人】バリュー一覧',
        path: 'pages.people.values.items',
        type: 'lines',
        parts: [{ key: 'title', label: 'タイトル' }, { key: 'body', label: '本文' }],
        help: linesHelp([{ label: 'タイトル' }, { label: '本文' }], '例: ぜんぶ自分ゴト化 | 強いオーナーシップをもって取り組もう。'),
      },
      { q: '【人】バリュー一覧の締めの言葉', path: 'pages.people.values.closingLines', type: 'lines', help: linesHelp(null, '一覧の最後のマスに入ります。不要なら空欄。') },
      img('【人】PURPOSEセクションの背景画像', 'pages.people.values.image.src'),
      { q: '【人】インタビューセクションの見出し', path: 'pages.people.interview.heading.title', type: 'text', help: '例: 先輩社員の、加工しない話' },
      { q: '【人】インタビューセクションのリード文', path: 'pages.people.interview.heading.lead', type: 'para' },
      { q: '【人】キャリアパスの見出し', path: 'pages.people.careerPath.heading.title', type: 'text', help: '例: 入社してからの、現実的な話。不要なら空欄。' },
      { q: '【人】キャリアパスのリード文', path: 'pages.people.careerPath.heading.lead', type: 'para' },
      {
        q: '【人】キャリアパスのステップ',
        path: 'pages.people.careerPath.steps',
        type: 'lines',
        parts: [{ key: 'phase', label: '時期' }, { key: 'title', label: 'タイトル' }, { key: 'body', label: '本文' }],
        help: linesHelp(
          [{ label: '時期' }, { label: 'タイトル' }, { label: '本文' }],
          '例: 1年目 | 徹底的に基礎を作る | 3ヶ月の新人研修後に配属。',
        ),
      },
      img('【人】キャリアパスの画像', 'pages.people.careerPath.image.src'),
      { q: '【人】キャリアパスの画像の説明', path: 'pages.people.careerPath.image.alt', type: 'text' },
    ],
  },
  {
    title: '6. 「選考を知る」ページ',
    help: '選考フロー・募集要項・FAQのページです。FAQの中身は別フォーム「コンテンツ登録」で1問ずつ登録します。',
    fields: [
      { q: '【選考】ページの説明文', path: 'pages.faq.meta.description', type: 'para', required: true, help: '120文字程度。' },
      { q: '【選考】ヒーローの見出し', path: 'pages.faq.hero.titleLines', type: 'lines', required: true, help: linesHelp(null, '2行程度を推奨します。') },
      { q: '【選考】ヒーローのリード文', path: 'pages.faq.hero.lead', type: 'para', required: true },
      img('【選考】ヒーロー画像', 'pages.faq.hero.image.src'),
      { q: '【選考】ヒーロー画像の説明', path: 'pages.faq.hero.image.alt', type: 'text' },
      {
        q: '【選考】ヒーローに並べる数字',
        path: 'pages.faq.hero.stats',
        type: 'lines',
        parts: [{ key: 'value', label: '値' }, { key: 'label', label: 'ラベル' }],
        help: linesHelp([{ label: '値' }, { label: 'ラベル' }], '4件を推奨。例: 通年 | エントリー受付'),
      },
      { q: '【選考】選考フローの見出し', path: 'pages.faq.flow.heading.title', type: 'text', help: '例: エントリーから内定まで' },
      { q: '【選考】選考フローのリード文', path: 'pages.faq.flow.heading.lead', type: 'para' },
      {
        q: '【選考】選考フローのステップ',
        path: 'pages.faq.flow.steps',
        type: 'lines',
        parts: [{ key: 'title', label: 'ステップ名' }, { key: 'body', label: '説明' }],
        help: linesHelp([{ label: 'ステップ名' }, { label: '説明' }], '5件までは横1列に並びます。例: エントリー | フォームから1分で完了。'),
      },
      {
        q: '【選考】募集要項',
        path: 'pages.faq.requirements.items',
        type: 'lines',
        parts: [{ key: 'label', label: '項目名' }, { key: 'value', label: '内容' }],
        help: linesHelp([{ label: '項目名' }, { label: '内容' }], '例: 勤務地 | 新宿本社ほか全国60拠点以上'),
      },
      { q: '【選考】募集要項の注記', path: 'pages.faq.requirements.note', type: 'para', help: '表の下に出る小さな一文。不要なら空欄。' },
      { q: '【選考】FAQセクションの見出し', path: 'pages.faq.faq.heading.title', type: 'text', help: '例: 聞きにくいことも、全部答えます' },
      { q: '【選考】FAQセクションのリード文', path: 'pages.faq.faq.heading.lead', type: 'para' },
    ],
  },
  {
    title: '7. エントリーセクション',
    help: '3ページ共通で末尾に入るエントリー導線です。',
    fields: [
      { q: '【エントリー】見出し', path: 'entry.titleLines', type: 'lines', help: linesHelp(null, '2行程度を推奨します。') },
      { q: '【エントリー】リード文', path: 'entry.lead', type: 'para' },
      img('【エントリー】背景画像', 'entry.image.src'),
      { q: '【エントリー】フォームの説明文', path: 'entry.form.note', type: 'para', help: 'フォーム上部に出る案内文。' },
    ],
  },
];

export const COMPANY_FIELDS = COMPANY_SECTIONS.flatMap((s) => s.fields);

/* ============================================================
 * フォームB「コンテンツ登録」— 1件につき1回、必要な数だけ繰り返し提出する
 * ========================================================== */

/** 種別を選ぶ質問。この回答でセクションが分岐する。 */
export const CONTENT_TYPE_Q = '登録する内容';
/** 表示順を指定する質問。空欄なら送信順。 */
export const CONTENT_ORDER_Q = '表示順';

export const CONTENT_TYPES = [
  {
    key: 'business',
    label: '事業',
    help: '「仕事を知る」ページの事業カードになります。3件程度を推奨します。',
    fields: [
      { q: '【事業】事業名', path: 'title', type: 'text', required: true, help: '例: 採用支援' },
      { q: '【事業】英語表記', path: 'en', type: 'text', required: true, help: 'カード内に小さく出ます。例: Recruitment' },
      { q: '【事業】説明文', path: 'description', type: 'para', required: true, help: '3行程度で。' },
      { q: '【事業】特徴タグ', path: 'tags', type: 'lines', help: linesHelp(null, '3件程度を推奨。例: RPO') },
      img('【事業】画像', 'image.src'),
    ],
  },
  {
    key: 'jobRole',
    label: '職種',
    help: '「仕事を知る」ページの職種カードになります。登録した順が比較表の列の順になります。',
    fields: [
      { q: '【職種】職種名', path: 'title', type: 'text', required: true, help: '例: 法人営業' },
      { q: '【職種】英語表記', path: 'en', type: 'text', required: true, help: '例: B2B Sales' },
      { q: '【職種】キャッチコピー', path: 'catch', type: 'text', required: true, help: '例: 企業の採用課題を、根っこから解く。' },
      { q: '【職種】仕事内容', path: 'body', type: 'para', required: true, help: '3行程度で。' },
      {
        q: '【職種】1日の流れ',
        path: 'day',
        type: 'lines',
        parts: [{ key: 'time', label: '時刻' }, { key: 'text', label: '内容' }],
        help: linesHelp([{ label: '時刻' }, { label: '内容' }], '例: 09:30 | チーム朝会・当日の商談準備'),
      },
      { q: '【職種】向いている人', path: 'fit', type: 'lines', help: linesHelp(null, '3件程度を推奨。例: 人と話すのが好き') },
      img('【職種】画像', 'image.src'),
    ],
  },
  {
    key: 'employee',
    label: '社員インタビュー',
    help: '「人を知る」ページの大きなインタビューカードになります。',
    fields: [
      { q: '【社員】氏名', path: 'name', type: 'text', required: true, help: '例: 田中 花子' },
      { q: '【社員】所属部署', path: 'department', type: 'text', required: true, help: '例: 法人営業部' },
      { q: '【社員】入社年', path: 'joined', type: 'text', required: true, help: '西暦4桁。例: 2021' },
      { q: '【社員】インタビューの見出し', path: 'headline', type: 'para', required: true, help: '1文で。例: 入社2年目でチームリーダーへ。' },
      {
        q: '【社員】社内での歩み',
        path: 'timeline',
        type: 'lines',
        parts: [{ key: 'year', label: '年' }, { key: 'label', label: '出来事' }],
        help: linesHelp([{ label: '年' }, { label: '出来事' }], '例: 2021 | 入社・法人営業配属'),
      },
      {
        q: '【社員】質問と回答',
        path: 'sections',
        type: 'lines',
        parts: [{ key: 'title', label: '質問' }, { key: 'content', label: '回答' }],
        help: linesHelp([{ label: '質問' }, { label: '回答' }], '4件を推奨。例: 入社理由 | ミッションに共感しました。'),
      },
      { q: '【社員】印象的なエピソード', path: 'episode', type: 'para', help: '3行程度で。不要なら空欄。' },
      img('【社員】写真', 'image.src'),
    ],
  },
  {
    key: 'member',
    label: '社員（小カード）',
    help: '「人を知る」ページ下部に並ぶ小さいカードです。インタビューより手軽に人数を出せます。',
    fields: [
      { q: '【小カード】氏名', path: 'name', type: 'text', required: true, help: '例: 山田 美咲' },
      { q: '【小カード】イニシャル', path: 'initials', type: 'text', required: true, help: 'カード左上に出ます。例: Y.M' },
      { q: '【小カード】所属部署', path: 'department', type: 'text', required: true, help: '例: 新規事業開発部' },
      { q: '【小カード】入社年', path: 'joined', type: 'text', required: true, help: '西暦4桁。例: 2022' },
      { q: '【小カード】ひとこと', path: 'headline', type: 'para', required: true, help: '1文で。例: 3年目で新規事業を立ち上げ' },
    ],
  },
  {
    key: 'faq',
    label: 'よくある質問',
    help: '「選考を知る」ページのFAQです。同じカテゴリ名を付けた質問がひとまとまりで表示されます。',
    fields: [
      { q: '【FAQ】カテゴリ', path: 'category', type: 'text', required: true, help: '例: 選考について / 働き方について' },
      { q: '【FAQ】質問', path: 'q', type: 'text', required: true },
      { q: '【FAQ】回答', path: 'a', type: 'para', required: true },
    ],
  },
];

export const CONTENT_FIELDS = CONTENT_TYPES.flatMap((t) => t.fields);
