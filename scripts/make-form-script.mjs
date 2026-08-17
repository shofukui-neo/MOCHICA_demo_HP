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
      '「◯◯」の形式で例を添えていますので参考にしてください。回答は後から編集できます。',
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
      '件数の制限はありません。1件ごとにこのフォームを送信してください。',
    typeQuestion: CONTENT_TYPE_Q,
    orderQuestion: CONTENT_ORDER_Q,
    types: CONTENT_TYPES.map((t) => ({
      label: t.label,
      help: t.help ?? '',
      fields: t.fields.map(pick),
    })),
  },
};

const script = `/**
 * 採用LPのコンテンツ収集フォームを作成する Apps Script。
 *
 * 使い方
 *   1. https://script.google.com/ で新しいプロジェクトを作る
 *   2. このファイルの中身をすべて貼り付ける
 *   3. 関数 createForms を実行する（初回は権限の承認が必要）
 *   4. ログに出力されたURLを回答者に共有する
 *
 * 注意
 *   - このファイルは npm run intake:form で自動生成されています。
 *     質問文を変えたい場合は scripts/intake/fields.mjs を直してから再生成してください。
 *     フォーム画面で質問文を直接編集すると、回答シートの列見出しが変わり
 *     npm run intake:build が読めなくなります。
 *   - 画像の質問は記述式（URLまたはファイル名）で作られます。
 *     ファイルのアップロードにしたい場合は、作成後にフォーム編集画面で
 *     該当の質問を「ファイルのアップロード」に変更してください。
 *     質問文を変えなければ、そのまま npm run intake:build で読めます。
 */

var SPEC = ${JSON.stringify(spec, null, 2)};

function createForms() {
  var ss = SpreadsheetApp.create(SPEC.spreadsheetTitle);

  var companyForm = buildCompanyForm();
  var contentForm = buildContentForm();

  companyForm.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  contentForm.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  var lines = [
    '',
    '--- 作成しました ---',
    '回答スプレッドシート: ' + ss.getUrl(),
    '',
    '【会社基本情報】',
    '  回答用: ' + companyForm.getPublishedUrl(),
    '  編集用: ' + companyForm.getEditUrl(),
    '',
    '【コンテンツ登録】',
    '  回答用: ' + contentForm.getPublishedUrl(),
    '  編集用: ' + contentForm.getEditUrl(),
    '',
  ];
  Logger.log(lines.join('\\n'));
}

/** フォームA：会社基本情報（セクションを順に進む） */
function buildCompanyForm() {
  var form = FormApp.create(SPEC.company.title);
  form.setDescription(SPEC.company.description);
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);

  for (var i = 0; i < SPEC.company.sections.length; i++) {
    var section = SPEC.company.sections[i];
    if (i > 0) {
      var page = form.addPageBreakItem().setTitle(section.title);
      if (section.help) page.setHelpText(section.help);
    } else {
      var header = form.addSectionHeaderItem().setTitle(section.title);
      if (section.help) header.setHelpText(section.help);
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
  form.setDescription(SPEC.content.description);
  form.setAllowResponseEdits(true);
  form.setProgressBar(true);

  var typeItem = form.addMultipleChoiceItem()
    .setTitle(SPEC.content.typeQuestion)
    .setHelpText('登録したい内容を選ぶと、それに応じた入力欄が表示されます。')
    .setRequired(true);

  form.addTextItem()
    .setTitle(SPEC.content.orderQuestion)
    .setHelpText('表示したい順番を数字で入力してください（1が先頭）。空欄の場合は送信順になります。');

  // 種別ごとに1ページずつ用意する
  var pages = [];
  for (var i = 0; i < SPEC.content.types.length; i++) {
    var type = SPEC.content.types[i];
    var page = form.addPageBreakItem().setTitle(type.label);
    if (type.help) page.setHelpText(type.help);
    pages.push(page);

    for (var j = 0; j < type.fields.length; j++) {
      addField(form, type.fields[j]);
    }
  }

  // 各ページを回答し終えたら、次の種別に進まずそのまま送信させる
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

/** 1項目をフォームに追加する */
function addField(form, field) {
  var item;
  if (field.type === 'para' || field.type === 'lines') {
    item = form.addParagraphTextItem();
  } else {
    item = form.addTextItem();
  }
  item.setTitle(field.q);
  if (field.help) item.setHelpText(field.help);
  item.setRequired(field.required);
  return item;
}
`;

await mkdir(path.dirname(outFile), { recursive: true });
await writeFile(outFile, script, 'utf8');
console.log(`[intake] ${path.relative(root, outFile)} を生成しました。`);
console.log('        script.google.com に貼り付けて createForms() を実行してください。');
