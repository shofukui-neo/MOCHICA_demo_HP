/**
 * Google フォームを自動作成する Apps Script を生成する。
 *
 *   npm run intake:form
 *
 * 出力された intake/create-forms.gs を script.google.com に貼り付けて
 * createForms() を実行すると、2つのフォームと回答用スプレッドシートができる。
 *
 * 質問文は scripts/intake/fields.mjs と完全に一致するため、
 * 回答シートの列見出しがそのまま generate-config.mjs で読める。
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
const outFile = path.join(root, 'intake', 'create-forms.gs');

const pick = (f) => ({
  q: f.q,
  help: f.help ?? '',
  type: f.type,
  required: Boolean(f.required),
});

const spec = {
  spreadsheetTitle: '採用LP コンテンツ収集（回答）',
  company: {
    title: '採用LP コンテンツ収集｜会社基本情報',
    description:
      '採用サイトに載せる文章と画像をうかがいます。1社につき1回だけご回答ください。\n' +
      '各項目に入力例を添えていますので参考にしてください。\n' +
      '送信後に届く「回答を編集」リンクから、あとで直すこともできます。',
    confirmation:
      'ご回答ありがとうございました。\nこの画面の「回答を編集」リンクから、あとから内容を修正できます。',
    sections: COMPANY_SECTIONS.map((s) => ({
      title: s.title,
      help: s.help ?? '',
      fields: s.fields.map(pick),
    })),
  },
  content: {
    title: '採用LP コンテンツ収集｜コンテンツ登録',
    description:
      '事業・職種・社員・よくある質問を1件ずつご登録ください。\n' +
      '件数の制限はありません。1件登録するごとに送信し、続けて次の1件を登録してください。',
    confirmation:
      '1件登録しました。\n続けて登録する場合は下の「別の回答を送信」からどうぞ。',
    typeQuestion: CONTENT_TYPE_Q,
    typeHelp: '登録したい内容を選ぶと、それに応じた入力欄が表示されます。',
    orderQuestion: CONTENT_ORDER_Q,
    orderHelp: '表示したい順番を数字で入力してください（1が先頭）。空欄の場合は送信順になります。',
    types: CONTENT_TYPES.map((t) => ({
      label: t.label,
      help: t.help ?? '',
      fields: t.fields.map(pick),
    })),
  },
};

/* ------------------------------------------------------------
 * 生成前の検証
 * 質問文はそのまま回答シートの列見出しになるため、
 * 1フォーム内で重複していると列が判別できなくなる。
 * ---------------------------------------------------------- */
const assertUniqueTitles = (label, titles) => {
  const seen = new Set();
  const dup = new Set();
  for (const t of titles) {
    if (!t || !t.trim()) throw new Error(`[intake] ${label}: 空の質問文があります。`);
    if (seen.has(t)) dup.add(t);
    seen.add(t);
  }
  if (dup.size > 0) {
    throw new Error(
      `[intake] ${label}: 質問文が重複しています（回答シートの列が判別できなくなります）:\n` +
        [...dup].map((d) => `  - ${d}`).join('\n'),
    );
  }
  return seen.size;
};

const companyCount = assertUniqueTitles(
  'フォームA（会社基本情報）',
  spec.company.sections.flatMap((s) => s.fields.map((f) => f.q)),
);
const contentCount = assertUniqueTitles('フォームB（コンテンツ登録）', [
  spec.content.typeQuestion,
  spec.content.orderQuestion,
  ...spec.content.types.flatMap((t) => t.fields.map((f) => f.q)),
]);

const script = `/**
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
 *   - フォームA「会社基本情報」  ${companyCount}問（7セクション）／1社1回だけ回答
 *   - フォームB「コンテンツ登録」${contentCount}問（種別で分岐）／1件ごとに繰り返し回答
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

var SPEC = ${JSON.stringify(spec, null, 2)};

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
  Logger.log(lines.join('\\n'));
  return lines.join('\\n');
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
`;

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, script, 'utf8');
console.log(`[intake] ${path.relative(root, outFile)} を生成しました。`);
console.log(`        フォームA: ${companyCount}問 / フォームB: ${contentCount}問（質問文の重複なし）`);
console.log('        script.google.com に貼り付けて createForms() を実行してください。');
