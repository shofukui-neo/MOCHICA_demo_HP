/**
 * ★ 新しい企業のサイトを作るときのひな形。
 *
 * 使い方
 *   1. このファイルを <slug>.config.ts としてコピーする
 *        cp src/config/companies/_starter.config.ts src/config/companies/acme.config.ts
 *   2. src/config/companies/index.ts に import と1行を追加して登録する
 *   3. 「◯◯」「例:」の部分を自社の文言に置き換える
 *   4. 画像を public/companies/<slug>/ に置き、images のパスを合わせる
 *   5. npm run dev -- --company acme で確認 → npm run build -- --company acme
 *
 * ファイル名が `_` で始まるあいだは登録簿から参照されないので、
 * 書きかけのまま置いておいてもビルドには影響しない。
 *
 * 各項目の意味は src/config/schema.ts のコメントを参照。
 * 不要なセクションは、そのブロックごと削除すればページに出力されない。
 */
import type { SiteConfig } from '../schema';

/**
 * 画像はここに集約する。public/companies/<slug>/ に置いたファイルを絶対パスで指定する。
 * 企業ごとにフォルダを分けることで、他社の画像とファイル名が衝突しない。
 */
const images = {
  heroJobs: '/companies/starter/hero-jobs.jpg',
  heroPeople: '/companies/starter/hero-people.jpg',
  heroFaq: '/companies/starter/hero-faq.jpg',
  statement: '/companies/starter/statement.jpg',
  career: '/companies/starter/career.jpg',
  office: '/companies/starter/office.jpg',
  team: '/companies/starter/team.jpg',
  meeting: '/companies/starter/meeting.jpg',
  field: '/companies/starter/field.jpg',
  future: '/companies/starter/future.jpg',
  business1: '/companies/starter/business-1.jpg',
  business2: '/companies/starter/business-2.jpg',
  business3: '/companies/starter/business-3.jpg',
  logo: '/companies/starter/logo.png',
};

export const siteConfig: SiteConfig = {
  brand: {
    name: '◯◯（サイト上の呼称・英字ロゴ表記）',
    company: '株式会社◯◯',
    year: '2027',
    purpose: '◯◯（採用サイトの軸になる一文）',
    logo: { src: images.logo, alt: '' },
    address: {
      postalCode: '000-0000',
      region: '東京都',
      locality: '◯◯区',
      street: '◯◯1-2-3 ◯◯ビル',
      country: 'JP',
    },
  },

  theme: {
    // 自社のブランドカラーに置き換える。ここを変えるだけで全ページの配色が変わる。
    colors: {
      primary: '#1a5fd0',
      primaryDark: '#123f8c',
      primaryLight: '#e5efff',
      deep: '#0a1f3d',
      green: '#0f9e5e',
      greenLight: '#dcfce7',
      purple: '#6d3aed',
      purpleLight: '#ede9fe',
      pink: '#d61f6e',
      pinkLight: '#fce7f3',
      orange: '#e0640c',
      orangeLight: '#ffedd5',
      surface: '#fbfbf9',
      surfaceMuted: '#f3f4f6',
      ink: '#0f172a',
    },
    fontFamily: '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif',
    fontUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap',
    // 画像を外部ホストから配信している場合だけ指定する
    preconnect: [],
  },

  meta: {
    lang: 'ja',
    titleTemplate: '{title} | {company} {year}年新卒採用',
    siteName: '株式会社◯◯ 新卒採用',
    skipLinkLabel: '本文へスキップ',
  },

  // Cloudflare Pages のプロジェクト名とURLは必ず一致させること
  origins: {
    jobs: 'https://example-jobs.pages.dev',
    people: 'https://example-people.pages.dev',
    faq: 'https://example-faq.pages.dev',
  },

  header: {
    brandName: '◯◯',
    brandSub: '2027 NEW GRADUATE',
    homeHref: '/',
    homeAriaLabel: '◯◯ トップへ',
    cta: { label: 'エントリー', href: '#entry' },
  },

  footer: {
    links: [{ label: 'コーポレートサイト ↗', href: 'https://example.com/', external: true }],
    notes: [],
    copyright: '© ◯◯',
  },

  entry: {
    id: 'entry',
    label: 'Entry',
    titleLines: ['◯◯（1行目）', '◯◯（2行目）'],
    lead: '◯◯（エントリーを後押しする2〜3行）',
    image: { src: images.future, alt: '' },
    primary: { label: 'エントリーする', href: '#entry-form' },
    secondary: { label: '説明会を予約する', href: '#entry-form' },
    form: {
      badge: 'ENTRY',
      note: '◯◯（フォームの説明文）',
      // action を指定すると実際に送信できるフォームになる。
      // 未指定のままだと入力・送信ができないデモ表示のまま。
      // action: 'https://example.com/entry',
      fields: [
        { label: 'お名前', name: 'name', type: 'text', placeholder: '山田 太郎', required: true },
        { label: 'メールアドレス', name: 'email', type: 'email', placeholder: 'taro@example.com', required: true },
      ],
      submitLabel: '送信する',
    },
  },

  pages: {
    /* ===== 仕事を知る ===== */
    jobs: {
      meta: {
        title: '仕事を知る',
        description: '◯◯（120文字程度。検索結果とSNSシェアに出る説明文）',
        ogImage: images.heroJobs,
      },
      hero: {
        eyebrow: 'JOBS — 仕事を知る',
        titleLines: ['◯◯（1行目）', '◯◯（2行目）'],
        lead: '◯◯（このページで何が分かるかを2〜3行で）',
        image: { src: images.heroJobs, alt: '◯◯で働く社員' },
        primary: { label: '職種を見る', href: '#jobs' },
        secondary: { label: 'エントリーする', href: '#entry' },
        stats: [
          { value: '◯領域', label: '事業ドメイン' },
          { value: '◯職種', label: '新卒募集' },
          { value: '◯拠点', label: '全国ネットワーク' },
          { value: '◯年', label: '創業' },
        ],
        accent: 'blue',
      },

      business: {
        id: 'business',
        heading: {
          label: '01 — Business',
          title: '◯◯（何をやっている会社かを一言で）',
          lead: '◯◯（事業構成の説明を2〜3行で）',
        },
        items: [
          {
            no: '01',
            title: '◯◯事業',
            en: 'Business One',
            image: { src: images.business1, alt: '◯◯事業のイメージ' },
            accent: 'blue',
            description: '◯◯（この事業が何をしているかを3行程度で）',
            tags: ['◯◯', '◯◯', '◯◯'],
          },
          {
            no: '02',
            title: '◯◯事業',
            en: 'Business Two',
            image: { src: images.business2, alt: '◯◯事業のイメージ' },
            accent: 'green',
            description: '◯◯',
            tags: ['◯◯', '◯◯'],
          },
          {
            no: '03',
            title: '◯◯事業',
            en: 'Business Three',
            image: { src: images.business3, alt: '◯◯事業のイメージ' },
            accent: 'orange',
            description: '◯◯',
            tags: ['◯◯', '◯◯'],
          },
        ],
        note: '◯◯（補足があれば。不要なら note ごと削除）',
      },

      numbers: {
        id: 'numbers',
        heading: {
          label: '02 — Numbers',
          title: '数字で見る◯◯',
          lead: '◯◯（会社の規模感を2行程度で）',
        },
        facts: [
          { value: '0000', unit: '年', label: '創業', note: '◯年◯月設立' },
          { value: '000', unit: '名', label: '従業員数', note: '◯◯時点' },
          { value: '000', unit: '億円', label: '売上高', note: '直近実績' },
          { value: '00', unit: '拠点', label: '全国ネットワーク', note: '◯◯〜◯◯' },
        ],
        image: { src: images.office, alt: '◯◯のオフィス' },
      },

      jobRoles: {
        id: 'jobs',
        heading: {
          label: '03 — Job Roles',
          title: '◯◯（職種紹介の見出し）',
          lead: '◯◯（読み方のガイドを2〜3行で）',
        },
        dayLabel: 'A DAY IN THE LIFE',
        fitLabel: 'こんな人に向いています',
        items: [
          {
            no: '01',
            title: '◯◯職',
            en: 'Role One',
            accent: 'blue',
            image: { src: images.meeting, alt: '◯◯職の仕事風景' },
            catch: '◯◯（職種のキャッチコピー）',
            body: '◯◯（仕事内容を3行程度で）',
            day: [
              { time: '09:30', text: '◯◯' },
              { time: '11:00', text: '◯◯' },
              { time: '14:00', text: '◯◯' },
              { time: '17:00', text: '◯◯' },
            ],
            fit: ['◯◯', '◯◯', '◯◯'],
          },
          {
            no: '02',
            title: '◯◯職',
            en: 'Role Two',
            accent: 'purple',
            image: { src: images.field, alt: '◯◯職の仕事風景' },
            catch: '◯◯',
            body: '◯◯',
            day: [
              { time: '10:00', text: '◯◯' },
              { time: '13:00', text: '◯◯' },
              { time: '16:00', text: '◯◯' },
            ],
            fit: ['◯◯', '◯◯'],
          },
        ],
      },

      comparison: {
        id: 'compare',
        heading: {
          label: '03 — Compare',
          title: '職種を横に並べて比べる',
          lead: '◯◯（比較表の読み方を1〜2行で）',
        },
        axisLabel: '比較軸',
        // columns を増減した場合は rows の values も同じ数に揃える
        columns: [
          { label: '◯◯職', accent: 'blue' },
          { label: '◯◯職', accent: 'purple' },
        ],
        rows: [
          { axis: '向き合う相手', values: ['◯◯', '◯◯'] },
          { axis: '成果の測り方', values: ['◯◯', '◯◯'] },
          { axis: '成果が出るまで', values: ['◯◯', '◯◯'] },
        ],
      },
    },

    /* ===== 人を知る ===== */
    people: {
      meta: {
        title: '人を知る',
        description: '◯◯（120文字程度）',
        ogImage: images.heroPeople,
      },
      hero: {
        eyebrow: 'PEOPLE — 人を知る',
        titleLines: ['◯◯（1行目）', '◯◯（2行目）'],
        lead: '◯◯（2〜3行）',
        image: { src: images.heroPeople, alt: '◯◯の社員たち' },
        primary: { label: '先輩の話を読む', href: '#interview' },
        secondary: { label: 'エントリーする', href: '#entry' },
        stats: [
          { value: '◯', label: 'VALUES' },
          { value: '◯歳', label: '平均年齢' },
          { value: '◯年目〜', label: 'リーダー登用例' },
          { value: '◯', label: '◯◯' },
        ],
        accent: 'purple',
      },

      values: {
        id: 'values',
        label: '02 — Purpose',
        title: '◯◯（PURPOSE をそのまま置くことが多い）',
        lead: '◯◯（目指す姿を2〜3行で）',
        image: { src: images.statement, alt: '' },
        itemsLabel: '◯ VALUES',
        items: [
          { no: '01', title: '◯◯', body: '◯◯' },
          { no: '02', title: '◯◯', body: '◯◯' },
          { no: '03', title: '◯◯', body: '◯◯' },
        ],
        closingLines: ['◯◯', '◯◯'],
      },

      interview: {
        id: 'interview',
        heading: {
          label: '03 — Interview',
          title: '◯◯（インタビューの見出し）',
          lead: '◯◯（1〜2行）',
        },
        joinedSuffix: '年入社',
        episodeLabel: 'EPISODE',
        employees: [
          {
            name: '◯◯ ◯◯',
            department: '◯◯部',
            joined: '2021',
            accent: 'blue',
            image: { src: images.meeting, alt: '◯◯部 ◯◯ ◯◯' },
            headline: '◯◯（インタビューの見出し。1文）',
            timeline: [
              { year: '2021', label: '入社・◯◯配属' },
              { year: '2023', label: '◯◯' },
            ],
            sections: [
              { title: '入社理由', content: '◯◯' },
              { title: '仕事内容とやりがい', content: '◯◯' },
              { title: 'これからのビジョン', content: '◯◯' },
              { title: '好きなところ', content: '◯◯' },
            ],
            episode: '◯◯（印象的なエピソードを3行程度で）',
          },
        ],
        othersLabel: 'OTHER MEMBERS',
        others: [
          { name: '◯◯ ◯◯', initials: 'A.B', headline: '◯◯', joined: '2022', department: '◯◯部', accent: 'green' },
          { name: '◯◯ ◯◯', initials: 'C.D', headline: '◯◯', joined: '2023', department: '◯◯部', accent: 'blue' },
        ],
      },

      careerPath: {
        id: 'career',
        heading: {
          label: '04 — Career Path',
          title: '◯◯（キャリアパスの見出し）',
          lead: '◯◯（2〜3行）',
        },
        steps: [
          { phase: '1年目', title: '◯◯', body: '◯◯' },
          { phase: '2〜3年目', title: '◯◯', body: '◯◯' },
          { phase: '4年目〜', title: '◯◯', body: '◯◯' },
        ],
        image: { src: images.career, alt: '◯◯で働く社員' },
      },
    },

    /* ===== 選考を知る ===== */
    faq: {
      meta: {
        title: '選考を知る',
        description: '◯◯（120文字程度）',
        ogImage: images.heroFaq,
      },
      hero: {
        eyebrow: 'ENTRY — 選考を知る',
        titleLines: ['◯◯（1行目）', '◯◯（2行目）'],
        lead: '◯◯（2〜3行）',
        image: { src: images.heroFaq, alt: '◯◯の選考風景' },
        primary: { label: 'エントリーする', href: '#entry' },
        secondary: { label: '募集要項を見る', href: '#requirements' },
        stats: [
          { value: '通年', label: 'エントリー受付' },
          { value: '◯週間', label: '内定までの平均' },
          { value: 'オンライン可', label: '全選考プロセス' },
          { value: '文理不問', label: '応募資格' },
        ],
        accent: 'orange',
      },

      flow: {
        id: 'flow',
        heading: {
          label: '02 — Flow',
          title: 'エントリーから内定まで',
          lead: '◯◯（所要期間などを1〜2行で）',
        },
        steps: [
          { step: '01', title: 'エントリー', body: '◯◯' },
          { step: '02', title: '会社説明会', body: '◯◯' },
          { step: '03', title: '面接', body: '◯◯' },
          { step: '04', title: '最終面接', body: '◯◯' },
          { step: '05', title: '内定', body: '◯◯' },
        ],
      },

      requirements: {
        id: 'requirements',
        heading: { label: '03 — Requirements', title: '募集要項' },
        items: [
          { label: '募集職種', value: '◯◯' },
          { label: '応募資格', value: '◯◯' },
          { label: '勤務地', value: '◯◯' },
          { label: '勤務時間', value: '◯◯' },
          { label: '休日休暇', value: '◯◯' },
          { label: '待遇・福利厚生', value: '◯◯' },
          { label: '選考プロセス', value: '◯◯' },
        ],
        note: '◯◯（注記があれば。不要なら note ごと削除）',
      },

      faq: {
        id: 'faq',
        heading: {
          label: '04 — FAQ',
          title: '◯◯（FAQの見出し）',
          lead: '◯◯（1〜2行）',
        },
        questionPrefix: 'Q.',
        answerPrefix: 'A.',
        groups: [
          {
            category: '選考について',
            items: [
              { q: '◯◯？', a: '◯◯' },
              { q: '◯◯？', a: '◯◯' },
            ],
          },
          {
            category: '働き方について',
            items: [
              { q: '◯◯？', a: '◯◯' },
              { q: '◯◯？', a: '◯◯' },
            ],
          },
        ],
      },
    },
  },
};
