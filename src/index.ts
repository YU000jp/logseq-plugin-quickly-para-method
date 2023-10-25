import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import { combinationNewPage } from './combination'
import CSSMain from './style.css?inline'
import { copyPageTitleLink, removePopup } from './lib'
import { createPageForPARA, openPARAfromToolbar } from './para'
import { runCommand } from './property'
import { settingsTemplate } from './settings'
import { slashCommandItems } from './slashCommand'
import ja from "./translations/ja.json"
import { update20231023ChangeSplit } from './update'

/* main */
const main = async () => {

  // i18n
  await l10nSetup({ builtinTranslations: { ja } })

  // Plugin settings
  logseq.useSettingsSchema(settingsTemplate())

  // 初期化
  if (!logseq.settings) {
    //各ページを作成
    createPageForPARA("Projects", "✈️", true)
    createPageForPARA("Areas of responsibility", "🏠", true)
    createPageForPARA("Resources", "🌍", true)
    createPageForPARA("Archives", "🧹", true)
    createPageForPARA("Inbox", "📧", false)

    //設定画面を開く
    setTimeout(() => logseq.showSettingsUI(), 300)
  }

  //Update 2023/10/23 必ず残す!!
  update20231023ChangeSplit()

  // external button on toolbar
  logseq.App.registerUIItem('toolbar', {
    key: 'openPARA',
    template: `<div id="openPARAbutton" data-rect><a class="button icon" data-on-click="openPARA" title="${t("Open PARA method menu")}" style="font-size:18px">⚓</a></div>`,
  })

  // page menu
  logseq.App.registerPageMenuItem(`⚓ ${t("Open PARA method menu")}`, () => {
    if (!parent.document.getElementById("quickly-para-method--openQuickly")) openPARAfromToolbar()
  })

  // Model
  model("quickly-para-method--openQuickly")

  //slash command menu
  if (logseq.settings?.slashCommandMenu === true) slashCommandItems()

  // CSS
  logseq.provideStyle(CSSMain);

}/* end_main */


const model = (popup: string) => logseq.provideModel({

  // ツールバー
  openPARA: () => {
    if (!parent.document.getElementById(popup)) openPARAfromToolbar()
  },

  // Inboxのコマンド呼び出し
  Inbox: () => runCommand("Inbox", "INBOX"),

  // Projectsのコマンド呼び出し
  Projects: () => runCommand("Projects", "PARA"),

  // Areas of responsibilityのコマンド呼び出し
  AreasOfResponsibility: () => runCommand("Areas of responsibility", "PARA"),

  // Resourcesのコマンド呼び出し
  Resources: () => runCommand("Resources", "PARA"),

  // Archivesのコマンド呼び出し
  Archives: () => runCommand("Archives", "PARA"),

  // ピックリストの送信ボタン
  pickListTagSubmitButton: () => {

    //<select id="pickListSelect">で選択された値を取得
    const selectionListValue: string = (parent.document.getElementById('pickListSelect') as HTMLSelectElement)!.value
    if (selectionListValue !== "") runCommand(selectionListValue, "Select")

  },

  // 新規プロジェクト作成ダイアログを開く
  NewProject: () => {
    removePopup() // ポップアップを閉じる
    combinationNewPage(`✈️ ${t("New Project Page")} / [Projects]`, "Projects")
  },

  // 受信トレイに入れる新規ページの作成ダイアログを開く
  NewPageInbox: () => {
    removePopup() // ポップアップを閉じる
    combinationNewPage(`📧 ${t("New page / [Inbox]")}`, "Inbox")
  },

  // 設定ボタン
  PARAsettingButton: () => logseq.showSettingsUI(),

  // ページタイトルのリンクをコピー
  copyPageTitleLink: () => copyPageTitleLink(),

})/* end_model */

logseq.ready(main).catch(console.error)