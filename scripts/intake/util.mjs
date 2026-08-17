/**
 * CSVの読み書きと、TypeScriptソースへの書き出しに使う小さなユーティリティ。
 */

/**
 * RFC4180 準拠のCSVパーサ。
 * Google スプレッドシートのCSVエクスポートは、セル内の改行・カンマを
 * ダブルクォートで囲んで出力するため、素朴な split では壊れる。
 */
export function parseCsv(text) {
  const src = text.replace(/^\uFEFF/, ''); // BOM を除去
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];

    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\r') {
      // CRLF の CR は読み飛ばす
    } else if (ch === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }

  if (cell !== '' || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  // 完全に空の行は落とす
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** 1セルをCSVとしてエスケープする */
export const toCsvCell = (value) => {
  const s = String(value ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
};

/** 二次元配列をCSVテキストにする（Excelでも開けるようBOM付き） */
export const toCsv = (rows) =>
  `\uFEFF${rows.map((r) => r.map(toCsvCell).join(',')).join('\r\n')}\r\n`;

/**
 * ヘッダー行をもとに、各行を「列見出し → 値」の Map にする。
 * 同じ見出しが複数あった場合は最初の列を採用する。
 */
export function toRecords(rows) {
  if (rows.length === 0) return { header: [], records: [] };
  const header = rows[0].map((h) => h.trim());
  const records = rows.slice(1).map((row) => {
    const map = new Map();
    header.forEach((key, i) => {
      if (!map.has(key)) map.set(key, (row[i] ?? '').trim());
    });
    return map;
  });
  return { header, records };
}

/** 'a.b.c' の位置に値を書き込む */
export function setPath(target, path, value) {
  const keys = path.split('.');
  let node = target;
  for (let i = 0; i < keys.length - 1; i += 1) {
    if (typeof node[keys[i]] !== 'object' || node[keys[i]] === null) node[keys[i]] = {};
    node = node[keys[i]];
  }
  node[keys[keys.length - 1]] = value;
}

/* ------------------------------------------------------------
 * 色の計算（メインカラーからホバー色・淡色を作る）
 * ---------------------------------------------------------- */

const parseHex = (hex) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`;

/** 黒に寄せる（ratio=0.3 なら30%暗くする） */
export const shade = (hex, ratio) => {
  const rgb = parseHex(hex);
  return rgb ? toHex(rgb.map((v) => v * (1 - ratio))) : hex;
};

/** 白に寄せる（ratio=0.92 なら92%白くする） */
export const tint = (hex, ratio) => {
  const rgb = parseHex(hex);
  return rgb ? toHex(rgb.map((v) => v + (255 - v) * ratio)) : hex;
};

/** 16進数カラーとして妥当か */
export const isHexColor = (hex) => parseHex(hex) !== null;

/* ------------------------------------------------------------
 * TypeScript リテラルへの書き出し
 * ---------------------------------------------------------- */

const IDENT = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

const quote = (s) =>
  `'${String(s).replaceAll('\\', '\\\\').replaceAll("'", "\\'").replaceAll('\n', '\\n')}'`;

/**
 * 値をTypeScriptのリテラル文字列にする。
 * キーは識別子として書ける場合はクォートを外し、手書きに近い見た目にする。
 */
export function serialize(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);

  if (value === null || value === undefined) return 'undefined';
  if (typeof value === 'string') return quote(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => `${padIn}${serialize(v, indent + 1)}`);
    return `[\n${items.join(',\n')},\n${pad}]`;
  }

  // 内部だけで使う参照マーカー（images.heroJobs のような生の識別子を出す）
  if (value.__raw) return value.__raw;

  const entries = Object.entries(value).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '{}';
  const body = entries.map(([k, v]) => {
    const key = IDENT.test(k) ? k : quote(k);
    return `${padIn}${key}: ${serialize(v, indent + 1)}`;
  });
  return `{\n${body.join(',\n')},\n${pad}}`;
}

/** serialize で識別子をそのまま出したいときに使う */
export const raw = (expression) => ({ __raw: expression });
