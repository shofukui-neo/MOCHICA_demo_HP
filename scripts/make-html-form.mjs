/**
 * Google アカウント不要で使える入力フォーム（単体HTML）を生成する。
 *
 *   npm run intake:html      →  intake/form.html
 *
 * ブラウザで開いて入力し、company.csv / content.csv をダウンロードすると
 * そのまま npm run intake:build に渡せる。入力内容はブラウザに自動保存される。
 *
 * 質問文は scripts/intake/fields.mjs と同一なので、
 * Google フォーム経由でもこのHTML経由でも、生成される site.config.ts は同じ。
 */
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMPANY_SECTIONS,
  CONTENT_ORDER_Q,
  CONTENT_TYPES,
  CONTENT_TYPE_Q,
} from './intake/fields.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const outFile = path.join(root, 'intake', 'form.html');

const pick = (f) => ({ q: f.q, help: f.help ?? '', type: f.type, required: Boolean(f.required) });

const spec = {
  timestampColumn: 'タイムスタンプ',
  typeQuestion: CONTENT_TYPE_Q,
  orderQuestion: CONTENT_ORDER_Q,
  sections: COMPANY_SECTIONS.map((s) => ({
    title: s.title,
    help: s.help ?? '',
    fields: s.fields.map(pick),
  })),
  types: CONTENT_TYPES.map((t) => ({
    key: t.key,
    label: t.label,
    help: t.help ?? '',
    fields: t.fields.map(pick),
  })),
};

/** </script> で早期終了しないようにエスケープしてから埋め込む */
const embed = JSON.stringify(spec).replaceAll('<', '\\u003c');

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>採用LP コンテンツ収集フォーム</title>

<style>
  /* ---- トークン：明るいテーマ（既定） ---- */
  :root {
    --ground: #f6f8f7;
    --surface: #ffffff;
    --surface-sunk: #eef2f1;
    --line: #dde5e2;
    --line-strong: #c3d0cc;
    --ink: #16211f;
    --muted: #5d6b68;
    --faint: #8a9793;
    --accent: #0f6d5f;
    --accent-hover: #0b5347;
    --accent-soft: #e2efeb;
    --on-accent: #ffffff;
    --warn: #9c4f1a;
    --warn-soft: #f8ebe0;
    --ok: #2f7d4f;
    --focus: #0f6d5f;
    --shadow: 0 1px 2px rgba(22, 33, 31, .06), 0 8px 24px -16px rgba(22, 33, 31, .3);
  }

  /* ---- 端末が暗いテーマ（明示指定が無いとき） ---- */
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --ground: #0f1513;
      --surface: #161d1b;
      --surface-sunk: #1c2523;
      --line: #2a3532;
      --line-strong: #3c4a46;
      --ink: #e7efec;
      --muted: #9aa9a5;
      --faint: #74827e;
      --accent: #4cbfa5;
      --accent-hover: #6fd3bb;
      --accent-soft: #17302b;
      --on-accent: #08201c;
      --warn: #d9975c;
      --warn-soft: #2e2318;
      --ok: #6cc48c;
      --focus: #4cbfa5;
      --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 8px 24px -16px rgba(0, 0, 0, .8);
    }
  }

  /* ---- 暗いテーマを明示指定 ---- */
  :root[data-theme="dark"] {
    --ground: #0f1513;
    --surface: #161d1b;
    --surface-sunk: #1c2523;
    --line: #2a3532;
    --line-strong: #3c4a46;
    --ink: #e7efec;
    --muted: #9aa9a5;
    --faint: #74827e;
    --accent: #4cbfa5;
    --accent-hover: #6fd3bb;
    --accent-soft: #17302b;
    --on-accent: #08201c;
    --warn: #d9975c;
    --warn-soft: #2e2318;
    --ok: #6cc48c;
    --focus: #4cbfa5;
    --shadow: 0 1px 2px rgba(0, 0, 0, .4), 0 8px 24px -16px rgba(0, 0, 0, .8);
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: var(--ground);
    color: var(--ink);
    font-family: "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic", "Noto Sans JP", Meiryo, system-ui, sans-serif;
    font-size: 15px;
    line-height: 1.75;
    -webkit-font-smoothing: antialiased;
  }

  /* 数字・英字ラベル・コードの声。日本語の本文と役割を分ける */
  .mono {
    font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
    font-variant-numeric: tabular-nums;
    letter-spacing: .04em;
  }

  a { color: var(--accent); }

  :focus-visible {
    outline: 2px solid var(--focus);
    outline-offset: 2px;
  }

  /* ---------- 全体レイアウト ---------- */
  .masthead {
    border-bottom: 1px solid var(--line);
    background: var(--surface);
  }
  .masthead .inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 22px 24px 20px;
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 8px 18px;
  }
  .masthead h1 {
    margin: 0;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: .01em;
  }
  .masthead p {
    margin: 0;
    color: var(--muted);
    font-size: 13px;
  }

  .shell {
    max-width: 1180px;
    margin: 0 auto;
    padding: 26px 24px 132px;
    display: grid;
    grid-template-columns: 232px minmax(0, 1fr);
    gap: 40px;
    align-items: start;
  }

  /* ---------- 左のセクション一覧 ---------- */
  .rail { position: sticky; top: 20px; display: flex; flex-direction: column; gap: 6px; }
  .rail h2 {
    margin: 0 0 2px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .18em;
    color: var(--faint);
    text-transform: uppercase;
  }
  .rail h2 + .rail-link { margin-top: 2px; }
  .rail h2:not(:first-child) { margin-top: 18px; }

  .rail-link {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: var(--muted);
    font: inherit;
    font-size: 13px;
    text-align: left;
    cursor: pointer;
    width: 100%;
  }
  .rail-link:hover { background: var(--surface-sunk); color: var(--ink); }
  .rail-link[aria-current="true"] { background: var(--accent-soft); color: var(--ink); font-weight: 700; }
  .rail-link .count { margin-left: auto; font-size: 11px; color: var(--faint); }
  .rail-link[data-state="done"] .count { color: var(--ok); }
  .rail-link[data-state="missing"] .count { color: var(--warn); font-weight: 700; }

  /* ---------- セクション ---------- */
  .section {
    background: var(--surface);
    border: 1px solid var(--line);
    border-radius: 8px;
    padding: 26px 28px 30px;
    margin-bottom: 20px;
    box-shadow: var(--shadow);
    scroll-margin-top: 20px;
  }
  .section > header { margin-bottom: 22px; }
  .section h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    letter-spacing: .01em;
    text-wrap: balance;
  }
  .section header p {
    margin: 6px 0 0;
    color: var(--muted);
    font-size: 13px;
    max-width: 62ch;
  }

  .fields { display: flex; flex-direction: column; gap: 22px; }

  .field label { display: block; }
  .field .label-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 5px;
  }
  .field .name { font-size: 14px; font-weight: 700; }
  .field .req {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .08em;
    padding: 1px 6px;
    border-radius: 3px;
    background: var(--warn-soft);
    color: var(--warn);
  }
  .field .help {
    margin: 0 0 7px;
    font-size: 12.5px;
    line-height: 1.65;
    color: var(--muted);
    max-width: 68ch;
  }

  input[type="text"], textarea, select {
    width: 100%;
    max-width: 68ch;
    padding: 9px 11px;
    border: 1px solid var(--line-strong);
    border-radius: 6px;
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 14px;
    line-height: 1.7;
  }
  textarea { resize: vertical; min-height: 84px; }
  input[type="text"]:focus, textarea:focus, select:focus { border-color: var(--accent); }
  .field[data-missing="true"] input, .field[data-missing="true"] textarea { border-color: var(--warn); }

  /* ---------- コンテンツ登録 ---------- */
  .add-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    padding: 14px 16px;
    border: 1px dashed var(--line-strong);
    border-radius: 8px;
    background: var(--surface-sunk);
    margin-bottom: 18px;
  }
  .add-row select { max-width: 220px; }

  .entry {
    border: 1px solid var(--line);
    border-radius: 8px;
    margin-bottom: 14px;
    background: var(--surface);
    overflow: hidden;
  }
  .entry > header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--surface-sunk);
    border-bottom: 1px solid var(--line);
  }
  .entry .kind { font-size: 13px; font-weight: 700; }
  .entry .idx { font-size: 11px; color: var(--faint); }
  .entry .summary {
    font-size: 12.5px;
    color: var(--muted);
    margin-left: 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
  }
  .entry .tools { display: flex; gap: 4px; margin-left: auto; }
  .entry .fields { padding: 20px 16px 22px; }

  .empty {
    padding: 26px 16px;
    text-align: center;
    color: var(--muted);
    font-size: 13.5px;
    border: 1px dashed var(--line-strong);
    border-radius: 8px;
  }

  /* ---------- ボタン ---------- */
  button {
    font: inherit;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color .12s ease, border-color .12s ease, color .12s ease;
  }
  .btn {
    padding: 8px 16px;
    font-size: 13.5px;
    font-weight: 700;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--ink);
  }
  .btn:hover { border-color: var(--accent); color: var(--accent); }
  .btn.primary {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--on-accent);
  }
  .btn.primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: var(--on-accent); }
  .btn.quiet { border-color: transparent; color: var(--muted); }
  .btn.quiet:hover { border-color: var(--line-strong); color: var(--ink); }
  .icon-btn {
    width: 28px;
    height: 26px;
    display: grid;
    place-items: center;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--muted);
    font-size: 12px;
  }
  .icon-btn:hover { border-color: var(--accent); color: var(--accent); }
  .icon-btn:disabled { opacity: .35; cursor: default; }
  .icon-btn:disabled:hover { border-color: var(--line-strong); color: var(--muted); }

  /* ---------- 下部のバー ---------- */
  .actionbar {
    position: fixed;
    inset: auto 0 0 0;
    border-top: 1px solid var(--line);
    background: var(--surface);
    box-shadow: 0 -8px 24px -20px rgba(0, 0, 0, .5);
    z-index: 10;
  }
  .actionbar .inner {
    max-width: 1180px;
    margin: 0 auto;
    padding: 12px 24px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 16px;
  }
  .status { font-size: 12.5px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
  .status .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ok); }
  .status[data-state="missing"] .dot { background: var(--warn); }
  .actionbar .spacer { flex: 1; }

  @media (max-width: 900px) {
    .shell { grid-template-columns: minmax(0, 1fr); gap: 20px; }
    .rail {
      position: static;
      flex-direction: row;
      overflow-x: auto;
      padding-bottom: 6px;
      gap: 4px;
    }
    .rail h2 { display: none; }
    .rail-link { width: auto; white-space: nowrap; }
    .section { padding: 22px 18px 24px; }
  }

  @media (prefers-reduced-motion: reduce) {
    * { transition: none !important; scroll-behavior: auto !important; }
  }
</style>

<header class="masthead">
  <div class="inner">
    <h1>採用LP コンテンツ収集フォーム</h1>
    <p>入力した内容はこの端末のブラウザに自動保存されます。送信はされません。</p>
  </div>
</header>

<div class="shell">
  <nav class="rail" id="rail" aria-label="セクション"></nav>
  <main id="main"></main>
</div>

<footer class="actionbar">
  <div class="inner">
    <p class="status" id="status"><span class="dot"></span><span id="status-text"></span></p>
    <span class="spacer"></span>
    <button type="button" class="btn quiet" id="import">CSVを読み込む</button>
    <button type="button" class="btn quiet" id="clear">入力を消去</button>
    <button type="button" class="btn" id="dl-content">content.csv</button>
    <button type="button" class="btn primary" id="dl-company">company.csv</button>
  </div>
</footer>

<input type="file" id="file" accept=".csv,text/csv" hidden>

<script>
(function () {
  'use strict';

  var SPEC = ${embed};
  var STORAGE_KEY = 'recruit-lp-intake-v1';

  var state = { company: {}, content: [] };

  /* ============================================================
   * CSV（DOMに触らない。Nodeからも検証できるようにしてある）
   * ========================================================== */

  function csvCell(value) {
    var s = String(value == null ? '' : value);
    return /[",\\r\\n]/.test(s) ? '"' + s.split('"').join('""') + '"' : s;
  }

  function toCsv(rows) {
    return '\\uFEFF' + rows.map(function (r) { return r.map(csvCell).join(','); }).join('\\r\\n') + '\\r\\n';
  }

  function parseCsv(text) {
    var src = text.replace(/^\\uFEFF/, '');
    var rows = [], row = [], cell = '', quoted = false;
    for (var i = 0; i < src.length; i++) {
      var ch = src[i];
      if (quoted) {
        if (ch === '"') {
          if (src[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; }
        } else { cell += ch; }
        continue;
      }
      if (ch === '"') { quoted = true; }
      else if (ch === ',') { row.push(cell); cell = ''; }
      else if (ch === '\\r') { /* skip */ }
      else if (ch === '\\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
      else { cell += ch; }
    }
    if (cell !== '' || row.length > 0) { row.push(cell); rows.push(row); }
    return rows.filter(function (r) {
      return r.some(function (c) { return c.trim() !== ''; });
    });
  }

  function companyQuestions() {
    var out = [];
    SPEC.sections.forEach(function (s) {
      s.fields.forEach(function (f) { out.push(f.q); });
    });
    return out;
  }

  function contentQuestions() {
    var out = [];
    SPEC.types.forEach(function (t) {
      t.fields.forEach(function (f) { out.push(f.q); });
    });
    return out;
  }

  function stamp() {
    var d = new Date();
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + '/' + p(d.getMonth() + 1) + '/' + p(d.getDate()) +
      ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
  }

  /** 会社基本情報 → 1行のCSV */
  function buildCompanyCsv(data, now) {
    var qs = companyQuestions();
    var header = [SPEC.timestampColumn].concat(qs);
    var row = [now || stamp()].concat(qs.map(function (q) { return data.company[q] || ''; }));
    return toCsv([header, row]);
  }

  /** コンテンツ登録 → 1件1行のCSV。表示順は並び順から振る */
  function buildContentCsv(data, now) {
    var qs = contentQuestions();
    var header = [SPEC.timestampColumn, SPEC.typeQuestion, SPEC.orderQuestion].concat(qs);
    var perType = {};
    var rows = data.content.map(function (entry) {
      var type = typeByKey(entry.type);
      perType[entry.type] = (perType[entry.type] || 0) + 1;
      return [now || stamp(), type ? type.label : '', String(perType[entry.type])].concat(
        qs.map(function (q) { return entry.values[q] || ''; })
      );
    });
    return toCsv([header].concat(rows));
  }

  /** CSVを読み戻す。見出しを見て company / content を判別する */
  function loadCsv(text, data) {
    var rows = parseCsv(text);
    if (rows.length < 2) return { kind: null, count: 0 };
    var header = rows[0].map(function (h) { return h.trim(); });
    var isContent = header.indexOf(SPEC.typeQuestion) >= 0;

    if (isContent) {
      var labelToKey = {};
      SPEC.types.forEach(function (t) { labelToKey[t.label] = t.key; });
      var loaded = [];
      rows.slice(1).forEach(function (row) {
        var values = {}, label = '';
        header.forEach(function (h, i) {
          var v = (row[i] || '').trim();
          if (h === SPEC.typeQuestion) label = v;
          else if (h !== SPEC.timestampColumn && h !== SPEC.orderQuestion && v) values[h] = v;
        });
        var key = labelToKey[label];
        if (key) loaded.push({ type: key, values: values });
      });
      data.content = loaded;
      return { kind: 'content', count: loaded.length };
    }

    var known = {};
    companyQuestions().forEach(function (q) { known[q] = true; });
    var last = rows[rows.length - 1];
    var filled = 0;
    header.forEach(function (h, i) {
      if (!known[h]) return;
      var v = (last[i] || '').trim();
      data.company[h] = v;
      if (v) filled++;
    });
    return { kind: 'company', count: filled };
  }

  function typeByKey(key) {
    for (var i = 0; i < SPEC.types.length; i++) {
      if (SPEC.types[i].key === key) return SPEC.types[i];
    }
    return null;
  }

  /** 未入力の必須項目を数える */
  function missingCount(data) {
    var n = 0;
    SPEC.sections.forEach(function (s) {
      s.fields.forEach(function (f) {
        if (f.required && !(data.company[f.q] || '').trim()) n++;
      });
    });
    data.content.forEach(function (entry) {
      var type = typeByKey(entry.type);
      if (!type) return;
      type.fields.forEach(function (f) {
        if (f.required && !(entry.values[f.q] || '').trim()) n++;
      });
    });
    return n;
  }

  // Node から読めるように公開する（ブラウザでは使われない）
  var api = {
    buildCompanyCsv: buildCompanyCsv,
    buildContentCsv: buildContentCsv,
    loadCsv: loadCsv,
    parseCsv: parseCsv,
    missingCount: missingCount,
    SPEC: SPEC,
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof globalThis !== 'undefined') globalThis.__intakeForm = api;

  if (typeof document === 'undefined') return;

  /* ============================================================
   * 画面
   * ========================================================== */

  var el = function (tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  };
  var $ = function (id) { return document.getElementById(id); };

  var uid = 0;

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function restore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && parsed.company) state.company = parsed.company;
      if (parsed && parsed.content) state.content = parsed.content;
    } catch (e) { /* 保存が使えない環境でもそのまま動かす */ }
  }

  /** 1項目の入力欄 */
  function fieldNode(field, getValue, setValue) {
    var wrap = el('div', 'field');
    var id = 'f' + (++uid);

    var labelRow = el('div', 'label-row');
    var label = el('label', 'name', field.q);
    label.setAttribute('for', id);
    labelRow.appendChild(label);
    if (field.required) labelRow.appendChild(el('span', 'req mono', '必須'));
    wrap.appendChild(labelRow);

    if (field.help) wrap.appendChild(el('p', 'help', field.help));

    var multiline = field.type === 'para' || field.type === 'lines';
    var input = document.createElement(multiline ? 'textarea' : 'input');
    if (!multiline) input.type = 'text';
    if (field.type === 'lines') input.rows = 4;
    input.id = id;
    input.value = getValue() || '';

    var sync = function () {
      setValue(input.value);
      wrap.dataset.missing = String(Boolean(field.required) && !input.value.trim());
      save();
      refreshStatus();
    };
    input.addEventListener('input', sync);
    input.addEventListener('change', sync);

    wrap.dataset.missing = String(Boolean(field.required) && !input.value.trim());
    wrap.appendChild(input);
    return wrap;
  }

  /* ---- 会社基本情報 ---- */
  function companySection(section, index) {
    var node = el('section', 'section');
    node.id = 'section-' + index;

    var head = document.createElement('header');
    head.appendChild(el('h3', null, section.title));
    if (section.help) head.appendChild(el('p', null, section.help));
    node.appendChild(head);

    var fields = el('div', 'fields');
    section.fields.forEach(function (field) {
      fields.appendChild(fieldNode(
        field,
        function () { return state.company[field.q]; },
        function (v) { state.company[field.q] = v; }
      ));
    });
    node.appendChild(fields);
    return node;
  }

  /* ---- コンテンツ登録 ---- */
  function entryNode(entry, position) {
    var type = typeByKey(entry.type);
    var node = el('article', 'entry');

    var head = document.createElement('header');
    head.appendChild(el('span', 'kind', type.label));
    head.appendChild(el('span', 'idx mono', '#' + position));

    var first = type.fields[0];
    var summary = (entry.values[first.q] || '').split('\\n')[0];
    head.appendChild(el('span', 'summary', summary || '（未入力）'));

    var tools = el('div', 'tools');
    var up = el('button', 'icon-btn', '↑');
    up.type = 'button';
    up.title = '上へ';
    var down = el('button', 'icon-btn', '↓');
    down.type = 'button';
    down.title = '下へ';
    var del = el('button', 'icon-btn', '×');
    del.type = 'button';
    del.title = '削除';

    var siblings = state.content.filter(function (e) { return e.type === entry.type; });
    var at = siblings.indexOf(entry);
    up.disabled = at === 0;
    down.disabled = at === siblings.length - 1;

    up.addEventListener('click', function () { move(entry, -1); });
    down.addEventListener('click', function () { move(entry, 1); });
    del.addEventListener('click', function () {
      if (!confirm(type.label + ' 「' + (summary || '未入力') + '」を削除します。よろしいですか？')) return;
      state.content.splice(state.content.indexOf(entry), 1);
      save();
      render();
    });

    tools.appendChild(up);
    tools.appendChild(down);
    tools.appendChild(del);
    head.appendChild(tools);
    node.appendChild(head);

    var fields = el('div', 'fields');
    type.fields.forEach(function (field) {
      fields.appendChild(fieldNode(
        field,
        function () { return entry.values[field.q]; },
        function (v) {
          entry.values[field.q] = v;
          if (field === type.fields[0]) {
            head.querySelector('.summary').textContent = v.split('\\n')[0] || '（未入力）';
          }
        }
      ));
    });
    node.appendChild(fields);
    return node;
  }

  /** 同じ種別の中で並び順を入れ替える */
  function move(entry, delta) {
    var siblings = state.content.filter(function (e) { return e.type === entry.type; });
    var at = siblings.indexOf(entry);
    var target = siblings[at + delta];
    if (!target) return;
    var i = state.content.indexOf(entry);
    var j = state.content.indexOf(target);
    state.content[i] = target;
    state.content[j] = entry;
    save();
    render();
  }

  function contentSection(type, index) {
    var node = el('section', 'section');
    node.id = 'content-' + type.key;

    var head = document.createElement('header');
    head.appendChild(el('h3', null, type.label));
    if (type.help) head.appendChild(el('p', null, type.help));
    node.appendChild(head);

    var add = el('div', 'add-row');
    var btn = el('button', 'btn', type.label + 'を追加');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      state.content.push({ type: type.key, values: {} });
      save();
      render();
      var added = document.querySelectorAll('#content-' + type.key + ' .entry');
      if (added.length) added[added.length - 1].scrollIntoView({ block: 'center' });
    });
    add.appendChild(btn);
    add.appendChild(el('span', 'help', '必要な件数だけ追加してください。並び順はそのままサイトに反映されます。'));
    node.appendChild(add);

    var mine = state.content.filter(function (e) { return e.type === type.key; });
    if (mine.length === 0) {
      node.appendChild(el('div', 'empty', 'まだ登録がありません。1件も登録しない場合、このセクションはサイトに表示されません。'));
    } else {
      mine.forEach(function (entry, i) { node.appendChild(entryNode(entry, i + 1)); });
    }
    return node;
  }

  /* ---- 左のセクション一覧 ---- */
  function railLink(label, targetId, done, total, required) {
    var btn = el('button', 'rail-link');
    btn.type = 'button';
    btn.appendChild(el('span', null, label));
    btn.appendChild(el('span', 'count mono', done + '/' + total));
    btn.dataset.state = required > 0 ? 'missing' : (total > 0 && done === total ? 'done' : 'partial');
    btn.addEventListener('click', function () {
      var target = $(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return btn;
  }

  function renderRail() {
    var rail = $('rail');
    rail.textContent = '';
    rail.appendChild(el('h2', null, '会社基本情報'));
    SPEC.sections.forEach(function (section, i) {
      var done = 0, missing = 0;
      section.fields.forEach(function (f) {
        var v = (state.company[f.q] || '').trim();
        if (v) done++;
        else if (f.required) missing++;
      });
      rail.appendChild(railLink(section.title, 'section-' + i, done, section.fields.length, missing));
    });

    rail.appendChild(el('h2', null, 'コンテンツ登録'));
    SPEC.types.forEach(function (type) {
      var mine = state.content.filter(function (e) { return e.type === type.key; });
      var missing = 0;
      mine.forEach(function (entry) {
        type.fields.forEach(function (f) {
          if (f.required && !(entry.values[f.q] || '').trim()) missing++;
        });
      });
      var btn = railLink(type.label, 'content-' + type.key, mine.length, mine.length, missing);
      btn.querySelector('.count').textContent = mine.length + '件';
      rail.appendChild(btn);
    });
  }

  function refreshStatus() {
    var missing = missingCount(state);
    var status = $('status');
    var text = $('status-text');
    status.dataset.state = missing > 0 ? 'missing' : 'ok';
    text.textContent = missing > 0
      ? '未入力の必須項目が ' + missing + ' 件あります'
      : '必須項目はすべて入力済みです';
    renderRail();
  }

  function render() {
    var main = $('main');
    main.textContent = '';
    SPEC.sections.forEach(function (section, i) { main.appendChild(companySection(section, i)); });
    SPEC.types.forEach(function (type, i) { main.appendChild(contentSection(type, i)); });
    refreshStatus();
  }

  /* ---- ダウンロード・読み込み ---- */
  function download(name, text) {
    var blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 0);
  }

  $('dl-company').addEventListener('click', function () {
    download('company.csv', buildCompanyCsv(state));
  });

  $('dl-content').addEventListener('click', function () {
    if (state.content.length === 0) {
      alert('コンテンツが1件も登録されていません。事業・職種・社員・よくある質問のいずれかを追加してください。');
      return;
    }
    download('content.csv', buildContentCsv(state));
  });

  $('import').addEventListener('click', function () { $('file').click(); });

  $('file').addEventListener('change', function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      var result = loadCsv(String(reader.result), state);
      if (!result.kind) {
        alert('CSVを読み取れませんでした。company.csv または content.csv を選んでください。');
      } else if (result.kind === 'company') {
        alert('会社基本情報を ' + result.count + ' 項目読み込みました。');
      } else {
        alert('コンテンツを ' + result.count + ' 件読み込みました。');
      }
      save();
      render();
    };
    reader.readAsText(file, 'utf-8');
    event.target.value = '';
  });

  $('clear').addEventListener('click', function () {
    if (!confirm('入力内容をすべて消去します。よろしいですか？')) return;
    state.company = {};
    state.content = [];
    save();
    render();
  });

  restore();
  render();
})();
</script>
`;

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, html, 'utf8');

const companyCount = spec.sections.reduce((n, s) => n + s.fields.length, 0);
const contentCount = spec.types.reduce((n, t) => n + t.fields.length, 0);
console.log(`[intake] ${path.relative(root, outFile)} を生成しました。`);
console.log(`        会社基本情報 ${companyCount}問 / コンテンツ登録 ${contentCount}問`);
console.log('        ブラウザで開いて入力し、company.csv と content.csv をダウンロードしてください。');
