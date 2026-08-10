/**
 * サイト全体のコンテンツ・画像を一元管理する。
 *
 * ▼画像について
 * 現在は neo-career.co.jp の公開画像を直リンクしている。
 * 本番運用では public/images/ に配置し、下記 IMAGES の値を
 * '/images/xxx.jpg' に差し替えるだけで全ページに反映される。
 */

export const IMAGES = {
  // ---- ヒーロー（コーポレートサイト実写） ----
  heroJobs:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/01/home-hero-slide-1-1-scaled.jpg',
  heroPeople:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/01/home-hero-slide-3-2-scaled.jpg',
  heroFaq:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/01/home-hero-slide-5-1-scaled.jpg',

  // ---- セクション背景・挿絵 ----
  statement:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/02/statement-hero-header-bg-scaled.jpg',
  career:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/02/home-career-img-1.png',
  office:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/01/home-hero-slide-7-1-scaled.jpg',
  team: 'https://www.neo-career.co.jp/wp-content/uploads/2024/01/home-hero-slide-6-2-scaled.jpg',
  meeting:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/01/home-hero-slide-2-2-scaled.jpg',
  field:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/01/home-hero-slide-4-1-scaled.jpg',
  future:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/01/home-hero-slide-10-1-scaled.jpg',

  // ---- 事業領域 ----
  bizRecruit:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/02/home-business-1.png',
  bizWork:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/02/home-business-2.png',
  bizOps:
    'https://www.neo-career.co.jp/wp-content/uploads/2024/02/home-business-3.png',

  // ---- ロゴ ----
  logoWhite:
    'https://www.neo-career.co.jp/wp-content/themes/neo-career-neo-theme/theme/img/neo-career-logo-white.svg',
  icon: 'https://www.neo-career.co.jp/wp-content/uploads/2023/12/cropped-neo-career-icon-270x270.png',
} as const;

export const SITE = {
  name: 'NEO CAREER',
  company: '株式会社ネオキャリア',
  year: '2027',
  purpose: '人と本気で向き合い、未来を切り拓く。',
  url: 'https://mochica-demo-hp.pages.dev',
} as const;

/** 会社概要（公開情報ベース） */
export const FACTS = [
  { value: '2000', unit: '年', label: '創業', note: '2000年11月15日設立' },
  { value: '3,486', unit: '名', label: '従業員数', note: 'グループ連結' },
  { value: '524', unit: '億円', label: '売上高', note: '直近実績' },
  { value: '60', unit: '拠点超', label: '全国ネットワーク', note: '北海道〜沖縄' },
] as const;

/** 事業領域（コーポレートサイト準拠の3領域） */
export const BUSINESSES = [
  {
    no: '01',
    title: '採用支援',
    en: 'Recruitment',
    image: IMAGES.bizRecruit,
    accent: 'blue',
    description:
      '新卒・中途・アルバイト・人材派遣まで、あらゆる採用ニーズに多彩なソリューションで応える。採用代行(RPO)まで含めた一気通貫の支援が強み。',
    tags: ['求人メディア200種以上', 'RPO', '採用コンサルティング'],
  },
  {
    no: '02',
    title: '就労支援',
    en: 'Career Support',
    image: IMAGES.bizWork,
    accent: 'green',
    description:
      '初めての就職活動から転職活動まで、一人ひとりに寄り添う。就職エージェントneo・第二新卒エージェントneoなど自社メディアを多数運営。',
    tags: ['新卒紹介', '第二新卒', '専門職就労支援'],
  },
  {
    no: '03',
    title: '業務支援',
    en: 'Business Support',
    image: IMAGES.bizOps,
    accent: 'orange',
    description:
      '営業代行・コールセンター代行・システム開発など専門性の高い業務を代行。保育所・学童保育室・介護施設の運営まで自社で手がける。',
    tags: ['BPO', 'システム開発', '施設運営'],
  },
] as const;

/** 職種 */
export const JOB_ROLES = [
  {
    no: '01',
    title: '法人営業',
    en: 'B2B Sales',
    accent: 'blue',
    image: IMAGES.meeting,
    catch: '企業の採用課題を、根っこから解く。',
    body: '経営者や人事責任者と直接向き合い、採用の課題をヒアリング。求人メディア・人材紹介・RPO・HR Techを組み合わせた最適解を設計して提案する。',
    day: [
      { time: '09:30', text: 'チーム朝会・当日の商談準備' },
      { time: '11:00', text: '既存クライアントへ運用report・追加提案' },
      { time: '14:00', text: '新規商談（採用課題ヒアリング）' },
      { time: '17:00', text: '提案資料作成・SFA入力' },
    ],
    fit: ['人と話すのが好き', '数字で成果を測りたい', '経営層と早く仕事がしたい'],
  },
  {
    no: '02',
    title: 'キャリアアドバイザー',
    en: 'Career Advisor',
    accent: 'purple',
    image: IMAGES.field,
    catch: '一人の人生の、分岐点に立ち会う。',
    body: '求職者との面談を通じてキャリアプランを一緒に設計。求人紹介から面接対策、内定承諾まで伴走する。人の意思決定に深く関わる仕事。',
    day: [
      { time: '10:00', text: '面談前の求人リサーチ' },
      { time: '11:00', text: '初回キャリア面談' },
      { time: '15:00', text: '選考対策・面接フィードバック' },
      { time: '18:00', text: '内定承諾フォロー・進捗管理' },
    ],
    fit: ['人の話を聴くのが得意', '相手の変化にやりがいを感じる', '長期の関係を築きたい'],
  },
  {
    no: '03',
    title: '企画 / マーケティング',
    en: 'Planning & Marketing',
    accent: 'pink',
    image: IMAGES.team,
    catch: '個の勝ち筋を、組織の型にする。',
    body: '自社メディアの集客設計、リード獲得施策、営業組織の生産性改善までを担う。データを見て打ち手を決め、仕組みに落とす役割。',
    day: [
      { time: '10:00', text: '流入・CVデータの分析' },
      { time: '13:00', text: '施策企画のブレスト' },
      { time: '16:00', text: 'LP改善・クリエイティブ確認' },
    ],
    fit: ['数字を分解するのが好き', '仕組み化に興味がある', '裏側から事業を動かしたい'],
  },
  {
    no: '04',
    title: '新規事業 / HR Tech',
    en: 'New Business & HR Tech',
    accent: 'orange',
    image: IMAGES.future,
    catch: '人の力を、テクノロジーで加速させる。',
    body: '採用管理システムMOCHICAをはじめとするHR Techプロダクトの企画・グロースを担当。2030年までに新規事業100創出を掲げる領域の中核。',
    day: [
      { time: '10:00', text: 'プロダクトの利用データ確認' },
      { time: '13:00', text: '開発チームとの仕様すり合わせ' },
      { time: '16:00', text: '導入企業へのヒアリング' },
    ],
    fit: ['0→1に関わりたい', 'プロダクトに興味がある', '不確実性を楽しめる'],
  },
] as const;

/** 7 VALUES（NEO CAREER STATEMENT より） */
export const VALUES = [
  { no: '01', title: 'ぜんぶ自分ゴト化', body: '全てのコトに対して、強いオーナーシップをもって取り組もう。' },
  { no: '02', title: '真摯さを貫こう', body: '一貫性、公平性、誠実さ、高い倫理観を持とう。' },
  { no: '03', title: 'プロのこだわりを', body: '自信、誇り、謙虚さ、利他、スピード、クオリティ。プロとしての基準を高め、期待を超えよう。' },
  { no: '04', title: '楽しむが、ど真ん中', body: '笑顔を絶やさず、明元素感を大切に。周りに活力を届ける存在でいよう。' },
  { no: '05', title: '大胆に挑み、成し遂げる', body: '未来に対して大胆に挑戦し続けることがカッコいい。挑戦したことを大いに称えよう。' },
  { no: '06', title: 'お客さまのために、社会のために', body: '強い使命感と情熱をもって、目の前のお客さまとその先にある社会に感動を届けよう。' },
  { no: '07', title: '想像から創造へ', body: 'もっと良くするために何ができるか？を想像し、未来の当たり前を創造しよう。' },
] as const;

/** 社員インタビュー（デモ用の想定人物） */
export const EMPLOYEES = [
  {
    name: '田中 花子',
    initials: 'T.H',
    department: '法人営業部',
    joined: '2021',
    accent: 'blue',
    image: IMAGES.meeting,
    headline: '入社2年目でチームリーダーへ。数字より“人”を大切にした営業スタイル',
    timeline: [
      { year: '2021', label: '入社・法人営業配属' },
      { year: '2022', label: 'チームリーダー' },
      { year: '2024', label: 'グループマネージャー' },
    ],
    sections: [
      { title: '入社理由', content: '「人のキャリアを支援する」というミッションに共感しました。自分自身も進路で悩んだ経験があり、同じように悩む人の力になりたいと思い入社を決めました。' },
      { title: '仕事内容とやりがい', content: '法人クライアントの採用課題をヒアリングし、最適なソリューションを提案しています。提案が受注に繋がり、実際に採用が動き出した時の達成感は何物にも代えがたいです。' },
      { title: 'これからのビジョン', content: 'マネージャーとして後輩育成にも力を入れたい。個人の数字ではなく、チーム全体で成果を出せるリーダーになりたいです。' },
      { title: '好きなところ', content: 'フラットな文化で、若手でも意見が通る。失敗を恐れずチャレンジできる環境が一番の魅力です。' },
    ],
    episode:
      '入社1年目、初めて自分だけで大型案件を受注。クライアントから「田中さんの提案で採用が変わった」と言われた瞬間、この仕事の意味を実感しました。',
  },
  {
    name: '佐藤 健太',
    initials: 'S.K',
    department: 'キャリアアドバイザー部',
    joined: '2020',
    accent: 'purple',
    image: IMAGES.field,
    headline: '求職者の人生に関わる仕事。1件1件に全力で向き合う',
    timeline: [
      { year: '2020', label: '入社・CA配属' },
      { year: '2022', label: '全社MVP受賞' },
      { year: '2023', label: '主任' },
    ],
    sections: [
      { title: '入社理由', content: '大学時代に就活支援のボランティアをしていた経験から、人のキャリア支援を仕事にしたいと考えていました。' },
      { title: '仕事内容とやりがい', content: '転職希望者との面談を通じて、キャリアプランの設計から内定獲得まで伴走します。内定承諾の連絡をもらう瞬間が最高です。' },
      { title: 'これからのビジョン', content: 'キャリアコンサルタント資格を取得し、より専門性の高い支援ができるようスキルアップ中です。' },
      { title: '好きなところ', content: '数字だけでなく求職者の満足度も評価に入る点。本質的な支援が評価される文化に共感しています。' },
    ],
    episode:
      '3年間伴走した求職者から、転職先での昇進報告とお礼の手紙が届きました。「佐藤さんのおかげで人生が変わった」という言葉は今も宝物です。',
  },
] as const;

export const MINI_EMPLOYEES = [
  { name: '山田 美咲', initials: 'Y.M', headline: '3年目で新規事業を立ち上げ', joined: '2022', dept: '新規事業開発部', accent: 'green' },
  { name: '鈴木 大輔', initials: 'S.D', headline: 'データ分析で採用DXを推進', joined: '2023', dept: 'HR Tech部', accent: 'blue' },
  { name: '伊藤 さくら', initials: 'I.S', headline: 'ヘルスケア事業の立ち上げメンバー', joined: '2022', dept: 'ヘルスケア事業部', accent: 'pink' },
  { name: '渡辺 翔', initials: 'W.S', headline: '入社1年目でMVP受賞', joined: '2024', dept: '法人営業部', accent: 'purple' },
] as const;

/** キャリアパス */
export const CAREER_STEPS = [
  { phase: '1年目', title: '徹底的に基礎を作る', body: '3ヶ月の新人研修後に配属。OJTトレーナーが付き、商談同行から始めて独り立ちを目指す。' },
  { phase: '2〜3年目', title: '裁量を持って動く', body: '担当クライアントを持ち、数字責任を負う。早い人はこのフェーズでリーダーに抜擢される。' },
  { phase: '4年目〜', title: '選択肢が広がる', body: 'マネジメント / スペシャリスト / 新規事業。社内公募制度で手を挙げれば領域を越えた挑戦も可能。' },
] as const;

/** FAQ */
export const FAQS = [
  {
    category: '選考について',
    items: [
      { q: '選考はいつから始まりますか？', a: '通年でエントリーを受け付けています。説明会参加後、随時選考へお進みいただけます。エントリーから内定まで平均3〜4週間程度です。' },
      { q: '学部・学科による有利不利はありますか？', a: 'ありません。文系・理系を問わず幅広い学部から入社しています。選考で見ているのは学んだ内容よりも、物事への向き合い方です。' },
      { q: '面接ではどんなことを聞かれますか？', a: '学生時代に力を入れたこと、その中での意思決定や工夫を深掘りします。準備した答えより、その場で考えた言葉を大切にしています。' },
      { q: 'オンラインでの選考は可能ですか？', a: '可能です。遠方にお住まいの方は全選考プロセスをオンラインで完結できます。最終面接のみ来社を推奨していますが、相談に応じます。' },
    ],
  },
  {
    category: '働き方について',
    items: [
      { q: '配属はどのように決まりますか？', a: '本人の希望・適性・各部門の状況を踏まえて決定します。内定後の面談で希望を丁寧にヒアリングした上で判断します。' },
      { q: '転勤はありますか？', a: '全国60拠点以上を展開しているため可能性はありますが、本人の希望を考慮します。エリア限定で働きたい旨も相談可能です。' },
      { q: '残業はどのくらいですか？', a: '部署により差はありますが月平均20〜30時間程度です。PC強制シャットダウンなど労務管理の仕組みを整備しています。' },
      { q: '若手のうちから裁量はありますか？', a: 'あります。入社1〜2年目でチームリーダーに抜擢される例も珍しくありません。年次より成果と意欲を見る文化です。' },
    ],
  },
  {
    category: '制度・環境について',
    items: [
      { q: '研修制度について教えてください。', a: '入社時の集合研修に加え、配属後のOJT、階層別研修、資格取得支援制度があります。キャリアコンサルタント等の資格取得者も多数在籍。' },
      { q: '社内公募制度はありますか？', a: 'あります。新規事業や他部門への異動に自ら手を挙げられる制度を運用しています。2030年に向けて新規事業100創出を掲げており、挑戦機会は豊富です。' },
      { q: '福利厚生について教えてください。', a: '各種社会保険完備、住宅補助、慶弔見舞金、産育休（取得実績多数）、自社運営の保育所利用など。詳細は募集要項をご確認ください。' },
    ],
  },
] as const;

/** 募集要項 */
export const REQUIREMENTS = [
  { label: '募集職種', value: '法人営業 / キャリアアドバイザー / 企画・マーケティング / 新規事業・HR Tech' },
  { label: '応募資格', value: '2027年3月までに国内外の大学・大学院・高専・専門学校を卒業（修了）見込みの方' },
  { label: '勤務地', value: '新宿本社（東京都新宿区西新宿1-22-2 新宿サンエービル）ほか全国60拠点以上' },
  { label: '勤務時間', value: '9:30〜18:30（実働8時間 / 休憩1時間）※部署により異なる' },
  { label: '休日休暇', value: '完全週休2日制（土日）、祝日、年末年始、年次有給休暇、慶弔休暇、産前産後・育児休暇' },
  { label: '待遇・福利厚生', value: '各種社会保険完備、交通費支給、資格取得支援、社内公募制度、表彰制度、健康診断' },
  { label: '選考プロセス', value: 'エントリー → 説明会 → 面接（複数回） → 最終面接 → 内定' },
] as const;

/** 選考フロー */
export const SELECTION_FLOW = [
  { step: '01', title: 'エントリー', body: '本サイトのフォームから1分で完了。' },
  { step: '02', title: '会社説明会', body: '事業・カルチャー・キャリアの全体像を共有。オンライン可。' },
  { step: '03', title: '面接（複数回）', body: '価値観と志向のすり合わせ。現場社員との対話も。' },
  { step: '04', title: '最終面接', body: '役員との面接。相互理解を最終確認。' },
  { step: '05', title: '内定', body: '内定後は配属面談・内定者交流会を実施。' },
] as const;
