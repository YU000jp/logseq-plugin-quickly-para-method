import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { LSPluginBaseInfo, PageEntity } from '@logseq/libs/dist/LSPlugin'
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import { AddMenuButton, handleRouteChange } from './batchTileView/handle'
import { addLeftMenuNavHeaderForEachPARA, clearEleAll } from './batchTileView/lib'
import { copyPageTitleLink, createPageForPARA, removePopup, renamePageAndProperty } from './lib'
import { slashCommandItems } from './lib/slashCommand'
import { combinationNamespace, combinationNewPage } from './menu/combination'
import { openMenuFromToolbar } from './menu/menu'
import { runCommand } from './menu/property'
import { keySettingsPageStyle, settingsTemplate, styleList } from './settings'
import CSSMain from './style.css?inline'
import af from "./translations/af.json"
import de from "./translations/de.json"
import es from "./translations/es.json"
import fr from "./translations/fr.json"
import id from "./translations/id.json"
import it from "./translations/it.json"
import ja from "./translations/ja.json"
import ko from "./translations/ko.json"
import nbNO from "./translations/nb-NO.json"
import nl from "./translations/nl.json"
import pl from "./translations/pl.json"
import ptBR from "./translations/pt-BR.json"
import ptPT from "./translations/pt-PT.json"
import ru from "./translations/ru.json"
import sk from "./translations/sk.json"
import tr from "./translations/tr.json"
import uk from "./translations/uk.json"
import zhCN from "./translations/zh-CN.json"
import zhHant from "./translations/zh-Hant.json"
import { update20231023ChangeSplit } from './update'



export const mainPageTitle = "Quickly-PARA-Method-Plugin" // メインページのタイトル
export const mainPageTitleLower = mainPageTitle.toLowerCase()
export const shortKey = "qpm"
export const keyToolbar = "Quickly-PARA-Method"
export const keyPageBarId = `${shortKey}--pagebar`
export const keyToggleButton = `${shortKey}--changeStyleToggle`
export const keySettingsButton = `${shortKey}--pluginSettings`
export const keyReloadButton = `${shortKey}--reload`
export const keyLeftMenu = `${shortKey}--nav-header`


/* main */
const main = async () => {

  // l10nのセットアップ
  await l10nSetup({
    builtinTranslations: {//Full translations
      ja, af, de, es, fr, id, it, ko, "nb-NO": nbNO, nl, pl, "pt-BR": ptBR, "pt-PT": ptPT, ru, sk, tr, uk, "zh-CN": zhCN, "zh-Hant": zhHant
    }
  })

  // Plugin settings
  logseq.useSettingsSchema(settingsTemplate())

  // メニュー用のボタンを追加
  AddMenuButton()

  // メニューバーのヘッダーに追加
  if (logseq.settings!.addLeftMenu === true)
    addLeftMenuNavHeaderForEachPARA()

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
    if (!parent.document.getElementById("quickly-para-method--openQuickly"))
      openMenuFromToolbar()
  })

  // Model
  model("quickly-para-method--openQuickly")

  //slash command menu
  if (logseq.settings?.slashCommandMenu === true) slashCommandItems()

  // CSS
  logseq.provideStyle(CSSMain)

  // プラグインが有効になったとき
  // document.bodyのクラスを変更する
  if (logseq.settings![keySettingsPageStyle])
    parent.document.body.classList.add(`${shortKey}-${logseq.settings![keySettingsPageStyle]}`)

  logseq.App.onRouteChanged(async ({ path, template }) => handleRouteChange(path, template))//ページ読み込み時に実行コールバック
  // logseq.App.onPageHeadActionsSlotted(async () => handleRouteChange())//Logseqのバグあり。動作保証が必要

  // プラグイン設定の項目変更時
  logseq.onSettingsChanged((
    newSet: LSPluginBaseInfo["settings"],
    oldSet: LSPluginBaseInfo["settings"]
  ) => {
    //Inboxのページ名を変更
    if (oldSet.inboxName !== newSet.inboxName)
      renamePageAndProperty(oldSet.inboxName as string, newSet.inboxName as string)

    // スタイル変更時の処理
    if (newSet[keySettingsPageStyle] !== oldSet[keySettingsPageStyle]) {
      //document.bodyのクラスを変更する
      if (oldSet[keySettingsPageStyle])
        parent.document.body.classList.remove(`${shortKey}-${oldSet[keySettingsPageStyle]}`)
      if (newSet[keySettingsPageStyle])
        parent.document.body.classList.add(`${shortKey}-${newSet[keySettingsPageStyle]}`)
    }

    if (oldSet.addLeftMenu !== newSet.addLeftMenu) {
      if (newSet.addLeftMenu === false)
        clearEleAll(`.${shortKey}--nav-header`)
      else
        addLeftMenuNavHeaderForEachPARA()
    }
    if (oldSet.inboxEnable !== newSet.inboxEnable) {
      if (newSet.inboxEnable === false) {
        clearEleAll(`.${shortKey}--nav-header`)
        addLeftMenuNavHeaderForEachPARA()
      } else
        addLeftMenuNavHeaderForEachPARA()
    }
  }
  )

  // プラグインが無効になったとき
  logseq.beforeunload(async () => {
    if (logseq.settings![keySettingsPageStyle])
      parent.document.body.classList.remove(`${shortKey}-${logseq.settings![keySettingsPageStyle]}`)
    clearEleAll(`.${shortKey}--nav-header`)
  })

}/* end_main */


let processingButton = false
const model = (popup: string) => logseq.provideModel({

  // ツールバー
  openPARA: () => {
    if (!parent.document.getElementById(popup))
      openMenuFromToolbar()
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
    if (selectionListValue !== "")
      runCommand(selectionListValue, "Select")

  },

  // namespaceの新規ページ作成
  namespaceNewPage: (e) => {
    removePopup() // ポップアップを閉じる

    const pageName: string = e.dataset.old // ページ名
    const namespaceName: string = e.dataset.namespace // namespace名
    if (namespaceName && pageName)
      combinationNamespace(pageName, namespaceName)
    else
      logseq.UI.showMsg("Can not get the current page", "error")
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


  // ツールバーボタンが押されたら
  [keyToolbar]: async () => {
    if (processingButton) return
    processingButton = true
    setTimeout(() => processingButton = false, 100)

    const pageEntity = await logseq.Editor.getPage(mainPageTitle, { includeChildren: false }) as PageEntity | null
    if (pageEntity) {
      logseq.App.pushState('page', { name: mainPageTitle })// ページを開く
    } else {
      await logseq.Editor.createPage(mainPageTitle, { public: false }, { redirect: true, createFirstBlock: true, journal: false })
      setTimeout(() => {
        const runButton = parent.document.getElementById(keyReloadButton) as HTMLElement | null
        if (runButton)
          runButton.click()
      }, 300)
    }
    logseq.UI.showMsg(`${mainPageTitle}`, "info", { timeout: 2200 })
  },

  // トグルボタンが押されたら
  [keyToggleButton]: () => {
    if (processingButton) return
    processingButton = true
    setTimeout(() => processingButton = false, 100)

    // スタイルを順番に切り替える
    logseq.updateSettings({
      [keySettingsPageStyle]: styleList[(styleList.indexOf(logseq.settings![keySettingsPageStyle] as string) + 1) % styleList.length]
    })
  },

  // 設定ボタンが押されたら
  [keySettingsButton]: () => {
    if (processingButton) return
    processingButton = true
    setTimeout(() => processingButton = false, 100)

    logseq.showSettingsUI()
  },

  // リロードボタンが押されたら
  [keyReloadButton]: async () => {
    if (processingButton) return
    processingButton = true
    setTimeout(() => processingButton = false, 100)

    const currentPage = await logseq.Editor.getCurrentPage() as { originalName: PageEntity["originalName"] } | null
    if (currentPage) {
      // currentPage.nameがQuickly-PARA-Method-Plugin/Projectsの場合に、スラッシュの右側Projectsの部分を取得
      const type = currentPage.originalName.split("/")[1]
      // console.log("currentPage.name", currentPage.originalName)
      // console.log("type", type)
      logseq.updateSettings({ [type]: undefined })
      logseq.App.pushState('page', { name: (mainPageTitle + "/" + type) })// ページを開く
    }
  },


})/* end_model */


logseq.ready(main).catch(console.error)