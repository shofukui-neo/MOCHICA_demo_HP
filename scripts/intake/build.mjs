/**
 * 回答データ（company 1件 + content N件） → site.config.ts の中身を組み立てる。
 *
 * フォームで集めないもの（英字ラベル・アクセント色・通し番号・微細ラベルなど）は
 * ここで既定値を補う。企業ごとの文言は既定値に一切含めない。
 */
import {
  COMPANY_FIELDS,
  CONTENT_ORDER_Q,
  CONTENT_TYPES,
  CONTENT_TYPE_Q,
} from './fields.mjs';
import { isHexColor, raw, serialize, setPath, shade, tint } from './util.mjs';

/* ------------------------------------------------------------
 * 既定値（テンプレートの骨格。企業固有の文言は含まない）
 * ---------------------------------------------------------- */

const PAGE_DEFAULTS = {
  jobs: {
    title: '仕事を知る',
    eyebrow: 'JOBS — 仕事を知る',
    accent: 'blue',
    primary: { label: '職種を見る', href: '#jobs' },
    secondary: { label: 'エントリーする', href: '#entry' },
  },
  people: {
    title: '人を知る',
    eyebrow: 'PEOPLE — 人を知る',
    accent: 'purple',
    primary: { label: '先輩の話を読む', href: '#interview' },
    secondary: { label: 'エントリーする', href: '#entry' },
  },
  faq: {
    title: '選考を知る',
    eyebrow: 'ENTRY — 選考を知る',
    accent: 'orange',
    primary: { label: 'エントリーする', href: '#entry' },
    secondary: { label: '募集要項を見る', href: '#requirements' },
  },
};

const SECTION_LABELS = {
  business: '01 — Business',
  numbers: '02 — Numbers',
  jobRoles: '03 — Job Roles',
  comparison: '03 — Compare',
  values: '02 — Purpose',
  interview: '03 — Interview',
  careerPath: '04 — Career Path',
  flow: '02 — Flow',
  requirements: '03 — Requirements',
  faq: '04 — FAQ',
};

/** アクセント色は登録順に巡回させる（フォームで色を選ばせない） */
const ACCENT_CYCLES = {
  business: ['blue', 'green', 'orange'],
  jobRole: ['blue', 'purple', 'pink', 'orange'],
  employee: ['blue', 'purple', 'pink', 'green'],
  member: ['green', 'blue', 'pink', 'purple'],
};

const FALLBACK_COLORS = {
  primary: '#1a5fd0',
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
};

const FONT_FAMILY =
  '"Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN", Meiryo, sans-serif';
const FONT_URL =
  'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;900&display=swap';

const pad2 = (i) => String(i + 1).padStart(2, '0');
const cycle = (list, i) => list[i % list.length];

/* ------------------------------------------------------------
 * 値の取り出し
 * ---------------------------------------------------------- */

const splitLines = (text) =>
  String(text ?? '')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

/** 「a | b | c」を parts に従って分解する */
function parseParts(line, parts) {
  const cells = line.split('|').map((s) => s.trim());
  const out = {};
  parts.forEach((part, i) => {
    if (part.rest) out[part.key] = cells.slice(i);
    else out[part.key] = cells[i] ?? '';
  });
  return out;
}

/**
 * 1項目を読む。列そのものが無い場合は null を返して呼び出し側に知らせる。
 */
function readField(record, field, issues, context = '') {
  if (!record.has(field.q)) {
    issues.missingColumns.add(field.q);
    return field.type === 'lines' ? [] : '';
  }
  const value = (record.get(field.q) ?? '').trim();

  if (field.required && !value) {
    issues.errors.push(`${context}必須項目が空です: 「${field.q}」`);
  }
  if (field.type !== 'lines') return value;

  const lines = splitLines(value);
  return field.parts ? lines.map((line) => parseParts(line, field.parts)) : lines;
}

/* ------------------------------------------------------------
 * 画像
 * ---------------------------------------------------------- */

const isDriveUrl = (url) => /drive\.google\.com|googleusercontent\.com/.test(url);

/**
 * 画像の入力値（公開URL / ファイル名 / Drive URL）を配信パスに正規化する。
 * Drive URL の場合は「この名前で保存してください」という一覧に積む。
 *
 * 保存先は企業ごとに public/companies/<slug>/ で分ける。
 * 同じファイル名（hero-jobs.jpg など）を各社が使っても衝突しない。
 */
function makeImageResolver(issues, slug) {
  /** varName -> 配信パス */
  const images = new Map();
  const dir = `companies/${slug}`;

  const resolveImage = function resolveImage(varName, input, label) {
    const value = String(input ?? '').trim();
    const localName = `${varName.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}.jpg`;

    let resolved;
    if (!value) {
      resolved = `/${dir}/${localName}`;
      issues.warnings.push(`画像が未入力です（${label}）。public/${dir}/${localName} を置いてください。`);
    } else if (isDriveUrl(value)) {
      resolved = `/${dir}/${localName}`;
      issues.downloads.push({ label, from: value, to: `public/${dir}/${localName}` });
    } else if (/^https?:\/\//.test(value)) {
      resolved = value;
    } else if (value.startsWith('/')) {
      resolved = value;
    } else {
      resolved = `/${dir}/${value}`;
    }

    images.set(varName, resolved);
    return raw(`images.${varName}`);
  };

  resolveImage.images = images;
  return resolveImage;
}

/* ------------------------------------------------------------
 * 組み立て
 * ---------------------------------------------------------- */

export function buildConfig({ companyRecord, contentRecords, slug }) {
  const issues = { errors: [], warnings: [], downloads: [], missingColumns: new Set() };

  // ---- 会社基本情報を素の入れ物に展開する ----
  const c = {};
  for (const field of COMPANY_FIELDS) {
    setPath(c, field.path, readField(companyRecord, field, issues));
  }

  // ---- コンテンツを種別ごとに仕分ける ----
  const byType = Object.fromEntries(CONTENT_TYPES.map((t) => [t.key, []]));
  const typeByLabel = new Map(CONTENT_TYPES.map((t) => [t.label, t]));

  contentRecords.forEach((record, index) => {
    const label = (record.get(CONTENT_TYPE_Q) ?? '').trim();
    const type = typeByLabel.get(label);
    if (!type) {
      issues.errors.push(
        `${index + 2}行目: 「${CONTENT_TYPE_Q}」が不明な値です（${label || '空欄'}）。` +
          `使える値: ${CONTENT_TYPES.map((t) => t.label).join(' / ')}`,
      );
      return;
    }
    const item = {};
    for (const field of type.fields) {
      setPath(item, field.path, readField(record, field, issues, `${index + 2}行目（${label}）: `));
    }
    const order = Number((record.get(CONTENT_ORDER_Q) ?? '').trim());
    byType[type.key].push({ item, order: Number.isFinite(order) ? order : index + 1000 });
  });

  for (const key of Object.keys(byType)) {
    byType[key].sort((a, b) => a.order - b.order);
    byType[key] = byType[key].map((entry) => entry.item);
  }

  const resolveImage = makeImageResolver(issues, slug);

  // ---- テーマ（メインカラーからホバー色・淡色を導出する）----
  const primary = isHexColor(c.theme?.colors?.primary)
    ? c.theme.colors.primary.trim()
    : FALLBACK_COLORS.primary;
  const deep = isHexColor(c.theme?.colors?.deep) ? c.theme.colors.deep.trim() : FALLBACK_COLORS.deep;
  if (c.theme?.colors?.primary && !isHexColor(c.theme.colors.primary)) {
    issues.warnings.push(
      `メインカラーが16進数として読めないため既定値を使いました（入力値: ${c.theme.colors.primary}）。`,
    );
  }

  const theme = {
    colors: {
      primary,
      primaryDark: shade(primary, 0.3),
      primaryLight: tint(primary, 0.92),
      deep,
      green: FALLBACK_COLORS.green,
      greenLight: FALLBACK_COLORS.greenLight,
      purple: FALLBACK_COLORS.purple,
      purpleLight: FALLBACK_COLORS.purpleLight,
      pink: FALLBACK_COLORS.pink,
      pinkLight: FALLBACK_COLORS.pinkLight,
      orange: FALLBACK_COLORS.orange,
      orangeLight: FALLBACK_COLORS.orangeLight,
      surface: FALLBACK_COLORS.surface,
      surfaceMuted: FALLBACK_COLORS.surfaceMuted,
      ink: FALLBACK_COLORS.ink,
    },
    fontFamily: FONT_FAMILY,
    fontUrl: FONT_URL,
    preconnect: [],
  };

  // ---- ヒーロー ----
  const hero = (pageKey) => {
    const d = PAGE_DEFAULTS[pageKey];
    const page = c.pages?.[pageKey]?.hero ?? {};
    return {
      eyebrow: d.eyebrow,
      titleLines: page.titleLines ?? [],
      lead: page.lead ?? '',
      image: {
        src: resolveImage(`hero${pageKey[0].toUpperCase()}${pageKey.slice(1)}`, page.image?.src, `${d.title}のヒーロー画像`),
        alt: page.image?.alt ?? '',
      },
      primary: d.primary,
      secondary: d.secondary,
      stats: page.stats ?? [],
      accent: d.accent,
    };
  };

  const heading = (key, source) => ({
    label: SECTION_LABELS[key],
    title: source?.title ?? '',
    lead: source?.lead || undefined,
  });

  /* ---- 仕事を知る ---- */
  const jobs = c.pages?.jobs ?? {};

  const businesses = byType.business.map((b, i) => ({
    no: pad2(i),
    title: b.title,
    en: b.en,
    image: {
      src: resolveImage(`business${i + 1}`, b.image?.src, `事業「${b.title}」の画像`),
      alt: `${b.title}のイメージ`,
    },
    accent: cycle(ACCENT_CYCLES.business, i),
    description: b.description,
    tags: b.tags ?? [],
  }));

  const jobRoles = byType.jobRole.map((r, i) => ({
    no: pad2(i),
    title: r.title,
    en: r.en,
    accent: cycle(ACCENT_CYCLES.jobRole, i),
    image: {
      src: resolveImage(`jobRole${i + 1}`, r.image?.src, `職種「${r.title}」の画像`),
      alt: `${r.title}の仕事風景`,
    },
    catch: r.catch,
    body: r.body,
    day: r.day ?? [],
    fit: r.fit ?? [],
  }));

  const comparisonRows = (jobs.comparison?.rows ?? []).map((row) => ({
    axis: row.axis,
    values: row.values ?? [],
  }));

  /* ---- 人を知る ---- */
  const people = c.pages?.people ?? {};

  const employees = byType.employee.map((e, i) => ({
    name: e.name,
    department: e.department,
    joined: e.joined,
    accent: cycle(ACCENT_CYCLES.employee, i),
    image: {
      src: resolveImage(`employee${i + 1}`, e.image?.src, `社員「${e.name}」の写真`),
      alt: `${e.department} ${e.name}`,
    },
    headline: e.headline,
    timeline: e.timeline ?? [],
    sections: e.sections ?? [],
    episode: e.episode ?? '',
  }));

  const members = byType.member.map((m, i) => ({
    name: m.name,
    initials: m.initials,
    department: m.department,
    joined: m.joined,
    accent: cycle(ACCENT_CYCLES.member, i),
    headline: m.headline,
  }));

  /* ---- 選考を知る ---- */
  const faqPage = c.pages?.faq ?? {};

  const faqGroups = [];
  for (const item of byType.faq) {
    let group = faqGroups.find((g) => g.category === item.category);
    if (!group) {
      group = { category: item.category, items: [] };
      faqGroups.push(group);
    }
    group.items.push({ q: item.q, a: item.a });
  }

  /* ---- セクションの採否（中身が無ければ丸ごと出力しない）---- */
  const businessSection = businesses.length
    ? {
        id: 'business',
        heading: heading('business', jobs.business?.heading),
        items: businesses,
        note: jobs.business?.note || undefined,
      }
    : undefined;

  const numbersSection = (jobs.numbers?.facts ?? []).length
    ? {
        id: 'numbers',
        heading: heading('numbers', jobs.numbers?.heading),
        facts: jobs.numbers.facts.map((f) => ({
          value: f.value,
          unit: f.unit || undefined,
          label: f.label,
          note: f.note || undefined,
        })),
        image: {
          src: resolveImage('office', jobs.numbers?.image?.src, '数字セクションの画像'),
          alt: jobs.numbers?.image?.alt ?? '',
        },
      }
    : undefined;

  const jobRolesSection = jobRoles.length
    ? {
        id: 'jobs',
        heading: heading('jobRoles', jobs.jobRoles?.heading),
        dayLabel: 'A DAY IN THE LIFE',
        fitLabel: 'こんな人に向いています',
        items: jobRoles,
      }
    : undefined;

  const comparisonSection =
    jobRoles.length && comparisonRows.length
      ? {
          id: 'compare',
          heading: heading('comparison', jobs.comparison?.heading),
          axisLabel: '比較軸',
          columns: jobRoles.map((r) => ({ label: r.title, accent: r.accent })),
          rows: comparisonRows,
        }
      : undefined;

  const valuesSection = (people.values?.items ?? []).length
    ? {
        id: 'values',
        label: SECTION_LABELS.values,
        title: people.values?.title || c.brand?.purpose || '',
        lead: people.values?.lead ?? '',
        image: {
          src: resolveImage('statement', people.values?.image?.src, 'PURPOSEセクションの背景画像'),
          alt: '',
        },
        itemsLabel: people.values?.itemsLabel || 'VALUES',
        items: people.values.items.map((v, i) => ({
          no: pad2(i),
          title: v.title,
          body: v.body,
        })),
        closingLines: people.values?.closingLines ?? [],
      }
    : undefined;

  const interviewSection = employees.length || members.length
    ? {
        id: 'interview',
        heading: heading('interview', people.interview?.heading),
        joinedSuffix: '年入社',
        episodeLabel: 'EPISODE',
        employees,
        othersLabel: 'OTHER MEMBERS',
        others: members,
      }
    : undefined;

  const careerSection = (people.careerPath?.steps ?? []).length
    ? {
        id: 'career',
        heading: heading('careerPath', people.careerPath?.heading),
        steps: people.careerPath.steps,
        image: {
          src: resolveImage('career', people.careerPath?.image?.src, 'キャリアパスの画像'),
          alt: people.careerPath?.image?.alt ?? '',
        },
      }
    : undefined;

  const flowSection = (faqPage.flow?.steps ?? []).length
    ? {
        id: 'flow',
        heading: heading('flow', faqPage.flow?.heading),
        steps: faqPage.flow.steps.map((s, i) => ({
          step: pad2(i),
          title: s.title,
          body: s.body,
        })),
      }
    : undefined;

  const requirementsSection = (faqPage.requirements?.items ?? []).length
    ? {
        id: 'requirements',
        heading: { label: SECTION_LABELS.requirements, title: '募集要項' },
        items: faqPage.requirements.items,
        note: faqPage.requirements?.note || undefined,
      }
    : undefined;

  const faqSection = faqGroups.length
    ? {
        id: 'faq',
        heading: heading('faq', faqPage.faq?.heading),
        questionPrefix: 'Q.',
        answerPrefix: 'A.',
        groups: faqGroups,
      }
    : undefined;

  /* ---- 全体 ---- */
  const corporateUrl = (c.$?.corporateUrl ?? '').trim();

  const config = {
    brand: {
      name: c.brand?.name ?? '',
      company: c.brand?.company ?? '',
      year: c.brand?.year ?? '',
      purpose: c.brand?.purpose ?? '',
      logo: { src: resolveImage('logo', c.brand?.logo?.src, 'ロゴ画像'), alt: '' },
      address: {
        postalCode: c.brand?.address?.postalCode ?? '',
        region: c.brand?.address?.region ?? '',
        locality: c.brand?.address?.locality ?? '',
        street: c.brand?.address?.street ?? '',
        country: 'JP',
      },
    },
    theme,
    meta: {
      lang: 'ja',
      titleTemplate: '{title} | {company} {year}年新卒採用',
      siteName: `${c.brand?.company ?? ''} 新卒採用`,
      skipLinkLabel: '本文へスキップ',
    },
    origins: {
      jobs: c.origins?.jobs ?? '',
      people: c.origins?.people ?? '',
      faq: c.origins?.faq ?? '',
    },
    header: {
      brandName: c.brand?.name ?? '',
      brandSub: `${c.brand?.year ?? ''} NEW GRADUATE`,
      homeHref: '/',
      homeAriaLabel: `${c.brand?.name ?? ''} トップへ`,
      cta: { label: 'エントリー', href: '#entry' },
    },
    footer: {
      links: corporateUrl
        ? [{ label: 'コーポレートサイト ↗', href: corporateUrl, external: true }]
        : [],
      notes: [],
      copyright: c.footer?.copyright ?? '',
    },
    entry: {
      id: 'entry',
      label: 'Entry',
      titleLines: c.entry?.titleLines ?? [],
      lead: c.entry?.lead ?? '',
      image: { src: resolveImage('entry', c.entry?.image?.src, 'エントリーの背景画像'), alt: '' },
      primary: { label: 'エントリーする', href: '#entry-form' },
      secondary: { label: '説明会を予約する', href: '#entry-form' },
      form: {
        badge: 'ENTRY',
        note: c.entry?.form?.note ?? '',
        fields: [
          { label: 'お名前', name: 'name', type: 'text', placeholder: '山田 太郎', required: true },
          { label: 'メールアドレス', name: 'email', type: 'email', placeholder: 'taro@example.com', required: true },
        ],
        submitLabel: '送信する',
      },
    },
    pages: {
      jobs: {
        meta: {
          title: PAGE_DEFAULTS.jobs.title,
          description: jobs.meta?.description ?? '',
          ogImage: raw('images.heroJobs'),
        },
        hero: hero('jobs'),
        business: businessSection,
        numbers: numbersSection,
        jobRoles: jobRolesSection,
        comparison: comparisonSection,
      },
      people: {
        meta: {
          title: PAGE_DEFAULTS.people.title,
          description: people.meta?.description ?? '',
          ogImage: raw('images.heroPeople'),
        },
        hero: hero('people'),
        values: valuesSection,
        interview: interviewSection,
        careerPath: careerSection,
      },
      faq: {
        meta: {
          title: PAGE_DEFAULTS.faq.title,
          description: faqPage.meta?.description ?? '',
          ogImage: raw('images.heroFaq'),
        },
        hero: hero('faq'),
        flow: flowSection,
        requirements: requirementsSection,
        faq: faqSection,
      },
    },
  };

  // 比較表の列数と各行の値の数が合っているか
  if (comparisonSection) {
    for (const row of comparisonSection.rows) {
      if (row.values.length !== comparisonSection.columns.length) {
        issues.warnings.push(
          `比較表「${row.axis}」の値が${row.values.length}件ですが、職種は${comparisonSection.columns.length}件です。` +
            '足りない列は空欄で表示されます。',
        );
      }
    }
  }

  if (!config.entry.form.note) {
    issues.warnings.push(
      'エントリーフォームは送信先（entry.form.action）が未設定のため、入力できないデモ表示になります。',
    );
  }

  return { config, images: resolveImage.images, issues };
}

/** 組み立てた設定を <slug>.config.ts のソースコードにする */
export function renderConfigSource(config, images, slug) {
  const imageEntries = [...images.entries()]
    .map(([key, value]) => `  ${key}: '${value.replaceAll("'", "\\'")}',`)
    .join('\n');

  return `/**
 * ★ このファイルは収集フォームの回答から自動生成されました（企業: ${slug}）。
 *    再生成: npm run intake:build -- --company ${slug}
 *
 * 生成後に直接編集してもかまいません（次回の再生成で上書きされます）。
 * 型定義と各項目の意味は src/config/schema.ts を参照してください。
 */
import type { SiteConfig } from '../schema';

/** 画像。public/companies/${slug}/ に置いたファイルを絶対パスで参照する。 */
const images = {
${imageEntries}
};

export const siteConfig: SiteConfig = ${serialize(config, 0)};
`;
}
