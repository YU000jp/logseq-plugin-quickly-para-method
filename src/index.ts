import '@logseq/libs' //https://plugins-doc.logseq.com/
import { LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin'
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { combinationNamespace, combinationNewPage } from './combination'
import { copyPageTitleLink, createPageForPARA, removePopup, renamePageAndProperty } from './lib'
import { openMenuFromToolbar } from './menu'
import { runCommand } from './property'
import { settingsTemplate } from './settings'
import { slashCommandItems } from './slashCommand'
import CSSMain from './style.css?inline'
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
    createPageForPARA(logseq.settings!.inboxName as string, "📧", false)

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
    if (!parent.document.getElementById("quickly-para-method--openQuickly")) openMenuFromToolbar()
  })

  // Model
  model("quickly-para-method--openQuickly")

  //slash command menu
  if (logseq.settings?.slashCommandMenu === true) slashCommandItems()

  // CSS
  logseq.provideStyle(CSSMain)


  // プラグイン設定の項目変更時
  logseq.onSettingsChanged((
    newSet: LSPluginBaseInfo["settings"],
    oldSet: LSPluginBaseInfo["settings"]
  ) => {
    //Inboxのページ名を変更
    if (oldSet.inboxName !== newSet.inboxName) renamePageAndProperty(oldSet.inboxName as string, newSet.inboxName as string)
  }
  )

}/* end_main */



const model = (popup: string) => logseq.provideModel({

  // ツールバー
  openPARA: () => {
    if (!parent.document.getElementById(popup)) openMenuFromToolbar()
  },

  // Inboxのコマンド呼び出し
  Inbox: () => runCommand(logseq.settings!.inboxName as string, "INBOX"),

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

  // namespaceの新規ページ作成
  namespaceNewPage: (e) => {
    removePopup() // ポップアップを閉じる

    const pageName: string = e.dataset.old // ページ名
    const namespaceName: string = e.dataset.namespace // namespace名
    if (namespaceName && pageName) combinationNamespace(pageName, namespaceName)
    else logseq.UI.showMsg(t("Failed (Can not get the current page)"), "error")
  },

  // 同じ階層レベルに新規プロジェクト (作成ダイアログを開く)
  NewProject: (e) => {
    removePopup() // ポップアップを閉じる

    // 新規ページを作成し、同じ階層レベルに記録する
    combinationNewPage(
      `✈️ [Projects] > ${t("New page")}`,
      "Projects",
      e.dataset.sameLevel ? e.dataset.sameLevel : "")
  },


  // 同じ階層レベルで、受信トレイに入れる新規ページ (作成ダイアログを開く)
  NewPageInbox: (e) => {
    removePopup() // ポップアップを閉じる

    // 新規ページを作成し、同じ階層レベルに記録する
    combinationNewPage(
      `📧 ${logseq.settings!.inboxName} > ${t("New page")}`
      , logseq.settings!.inboxName as string,
      e.dataset.sameLevel ? e.dataset.sameLevel : "")
  },

  // 新規ページ (作成ダイアログを開く)
  NewPage: (e) => {
    removePopup() // ポップアップを閉じる

    const sameLevel: string = e.dataset.sameLevel // 同じ階層レベルのページ名
    // 新規ページを作成し、同じ階層レベルに記録する
    combinationNewPage(
      `📄 ${t("New page")}`,
      "",
      sameLevel)
  },

  // 設定ボタン
  PARAsettingButton: () => logseq.showSettingsUI(),

  // ページ名のリンクをコピー
  copyPageTitleLink: () => copyPageTitleLink(),

})/* end_model */


logseq.ready(main).catch(console.error)