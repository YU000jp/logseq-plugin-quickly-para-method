import '@logseq/libs' //https://plugins-doc.logseq.com/
import { LSPluginBaseInfo, PageEntity } from '@logseq/libs/dist/LSPlugin'
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { AddMenuButton, handleRouteChange } from './batchTileView/handle'
import { addLeftMenuNavHeaderForEachPARA, clearEleAll } from './batchTileView/lib'
import { copyPageTitleLink, createPageForPARA, removePopup } from './lib'
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
import { update20231023ChangeSplit, update20250118Change } from './update'
import { detectDbGraphOnGraphChanged, detectDbGraphOnStartup, fetchLogseqVersion, guardDbGraph, showDbGraphIncompatibilityMsg } from './logseqDbGraphCheck'



export const mainPageTitle = "Quickly-PARA-Method-Plugin" // メインページのタイトル
export const mainPageTitleLower = mainPageTitle.toLowerCase()
export const shortKey = "qpm"
export const keyToolbar = "Quickly-PARA-Method"
export const keyPageBarId = `${shortKey}--pagebar`
export const keyToggleButton = `${shortKey}--changeStyleToggle`
export const keySettingsButton = `${shortKey}--pluginSettings`
export const keyReloadButton = `${shortKey}--reload`
export const keyLeftMenu = `${shortKey}--nav-header`

let pluginInitialized = false // 遅延初期化用フラグ

/* main */
const main = async () => {

  // グラフ切替時の再検出(ゲートより先に登録し、DBグラフで起動後にファイルグラフへ切り替えた場合に遅延初期化できるようにする)
  logseq.App.onCurrentGraphChanged(async () => {
    const isDb = await detectDbGraphOnGraphChanged()
    if (isDb === true)
      showDbGraphIncompatibilityMsg()
    else if (pluginInitialized === false)
      await initializePlugin()
  })

  // バージョン取得(診断用。グラフ種別の判定には使わない)
  await fetchLogseqVersion()

  // グラフ種別チェック。ファイルグラフのみ対応(DBグラフではpage-tagsプロパティをMD構文で書き込めないため)
  if (await detectDbGraphOnStartup() === true) {
    showDbGraphIncompatibilityMsg()
    return
  }

  await initializePlugin()
}

const initializePlugin = async () => {
  pluginInitialized = true

  // 100ms待つ
  await new Promise(resolve => setTimeout(resolve, 100))

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
    for (const page of [
      { name: "Projects", icon: "✈️" },
      { name: "Areas of responsibility", icon: "🏠" },
      { name: "Resources", icon: "🌍" },
      { name: "Archives", icon: "🧹" }
    ])
      createPageForPARA(page.name, page.icon, true)

    //設定画面を開く
    setTimeout(() => logseq.showSettingsUI(), 300)
  }

  //Update 2023/10/23 必ず残す!!
  update20231023ChangeSplit()

  // バグ修正用 Areas of Responsibility -> Areas of responsibility
  update20250118Change()

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
  }
  )

  // プラグインが無効になったとき
  logseq.beforeunload(async () => {
    if (logseq.settings![keySettingsPageStyle])
      parent.document.body.classList.remove(`${shortKey}-${logseq.settings![keySettingsPageStyle]}`)
    clearEleAll(`.${shortKey}--nav-header`)
  })

}/* end_main */



// Model

// ボタン処理中フラグ
let processingButton = false

const model = (popup: string) =>
  logseq.provideModel({
    openPARA: () => {// ツールバー
      if (guardDbGraph()) return
      if (!parent.document.getElementById(popup))
        openMenuFromToolbar()
    },
    Projects: () => runCommand("Projects", "PARA"),
    AreasOfResponsibility: () => runCommand("Areas of responsibility", "PARA"),
    Resources: () => runCommand("Resources", "PARA"),
    Archives: () => runCommand("Archives", "PARA"),
    pickListTagSubmitButton: () => {// ピックリストの送信ボタン

      const selectionListValue: string = (parent.document.getElementById('pickListSelect') as HTMLSelectElement)!.value//<select id="pickListSelect">で選択された値を取得
      if (selectionListValue !== "")
        runCommand(selectionListValue, "Select")
    },
    namespaceNewPage: (e) => {// namespaceの新規ページ作成
      removePopup() // ポップアップを閉じる

      const pageName: string = e.dataset.old // ページ名
      const namespaceName: string = e.dataset.namespace // namespace名
      if (namespaceName && pageName)
        combinationNamespace(pageName, namespaceName)
      else
        logseq.UI.showMsg("Can not get the current page", "error")
    },
    NewProject: (e) => {// 同じ階層レベルに新規プロジェクト (作成ダイアログを開く)
      removePopup() // ポップアップを閉じる

      // 新規ページを作成し、同じ階層レベルに記録する
      combinationNewPage(
        `✈️ [Projects] > ${t("New page")}`,
        "Projects",
        e.dataset.sameLevel ? e.dataset.sameLevel : "")
    },
    NewPage: (e) => {// 新規ページ (作成ダイアログを開く)
      removePopup() // ポップアップを閉じる

      const sameLevel: string = e.dataset.sameLevel // 同じ階層レベルのページ名
      // 新規ページを作成し、同じ階層レベルに記録する
      combinationNewPage(
        `📄 ${t("New page")}`,
        "",
        sameLevel)
    },
    PARAsettingButton: () => logseq.showSettingsUI(),// 設定ボタン
    copyPageTitleLink: () => copyPageTitleLink(),// ページ名のリンクをコピー
    [keyToolbar]: async () => {// ツールバーボタンが押されたら
      if (processingButton || guardDbGraph()) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)
      if (await logseq.Editor.getPage(mainPageTitle, { includeChildren: false }) as PageEntity | null)
        logseq.App.pushState('page', { name: mainPageTitle })// ページを開く
      else {
        await logseq.Editor.createPage(mainPageTitle, { public: false }, { redirect: true, createFirstBlock: true, journal: false })
        setTimeout(() => {
          const runButton = parent.document.getElementById(keyReloadButton) as HTMLElement | null
          if (runButton)
            runButton.click()
        }, 300)
      }
      logseq.UI.showMsg(`${mainPageTitle}`, "info", { timeout: 2200 })
    },
    [keyToggleButton]: () => {// トグルボタンが押されたら
      if (processingButton) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      // スタイルを順番に切り替える
      logseq.updateSettings({
        [keySettingsPageStyle]: styleList[(styleList.indexOf(logseq.settings![keySettingsPageStyle] as string) + 1) % styleList.length]
      })
    },
    [keySettingsButton]: () => {// 設定ボタンが押されたら
      if (processingButton) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      logseq.showSettingsUI()
    },
    [keyReloadButton]: async () => {// リロードボタンが押されたら
      if (processingButton || guardDbGraph()) return
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