import { PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { openPageFromPageName } from './lib'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n


// ツールバーからPARAメニューを開く
export const openMenuFromToolbar = async () => {
  let template = "" // テンプレート(HTML)用
  let title = "" // タイトル用

  // 現在のページを取得
  const getPage = await logseq.Editor.getCurrentPage() as PageEntity | null
  if (getPage) {

    // ページが存在する場合
    title = getPage.originalName
    // PARAページに該当する場合のフラグ
    const flagPARA = getPage.originalName === "Projects"
      || getPage.originalName === "Areas of responsibility"
      || getPage.originalName === "Resources"
      || getPage.originalName === "Archives"
      || getPage.originalName === logseq.settings!.inboxName
      ? true : false
    // タグボタンの表示は、Journalページではなく、paraページでもない場合のみ
    const flagTagButton: boolean = getPage['journal?'] === false && flagPARA === false
    template = `
  <div style="user-select: none">
    <ul>
      <li><button data-on-click="copyPageTitleLink">📋 ${t("Copy the page name to clipboard")}</button></li>
      <li><button data-on-click="Inbox">/📧 ${t("Into [Inbox]")}</button></li>
      <li style="margin-top:.6em" class="para-away">${createPickListSelect(flagTagButton)}</li>
      <hr/>
      <li class="para-away"><span>/✈️ [Projects]</span><span>${flagTagButton ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="Projects">${t("Tag")}</button></small> | ` : ''}<small><button id="paraOpenButtonProjects" title="${t("Press Shift key at the same time to open in sidebar")}">${t("Open")}</button></small></span></li>
      <li class="para-away"><span>/🏠 [Areas of responsibility]</span><span>${flagTagButton ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="AreasOfResponsibility">${t("Tag")}</button></small> | ` : ''}<small><button id="paraOpenButtonAreas" title="${t("Press Shift key at the same time to open in sidebar")}">${t("Open")}</button></small></span></li>
      <li class="para-away"><span>/🌍 [Resources]</span><span>${flagTagButton ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="Resources">${t("Tag")}</button></small> | ` : ''}<small><button id="paraOpenButtonResources" title="${t("Press Shift key at the same time to open in sidebar")}">${t("Open")}</button></small></span></li>
      <li class="para-away"><span>/🧹 [Archives]</span><span>${flagTagButton ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="Archives">${t("Tag")}</button></small> | ` : ''}<small><button id="paraOpenButtonArchives" title="${t("Press Shift key at the same time to open in sidebar")}">${t("Open")}</button></small></span></li>
    </ul>
    <hr/>
      `
  } else {

    // ページが存在しない場合
    title = "⚓"
    template = `
    <div title="" style="user-select: none">
    <ul>
      <li style="margin-top:.6em" class="para-away">${createPickListSelect(false)}</li>
      <hr/>
      <li class="para-away"><span>/✈️ [Projects]</span><span><small><button id="paraOpenButtonProjects" title="${t("Press Shift key at the same time to open in sidebar")}">${t("Open")}</button></small></span></li>
      <li class="para-away"><span>/🏠 [Areas of responsibility]</span><span><small><button id="paraOpenButtonAreas" title="${t("Press Shift key at the same time to open in sidebar")}">${t("Open")}</button></small></span></li>
      <li class="para-away"><span>/🌍 [Resources]</span><span><small><button id="paraOpenButtonResources" title="${t("Press Shift key at the same time to open in sidebar")}">${t("Open")}</button></small></span></li>
      <li class="para-away"><span>/🧹 [Archives]</span><span><small><button id="paraOpenButtonArchives" title="${t("Press Shift key at the same time to open in sidebar")}">${t("Open")}</button></small></span></li>
    </ul>
    <hr/>
    `
  }

  template += `
  <ul title="">
  <h2>${t("Combination Menu")}</h2>
  <h3>${t("New page")} +</h3>
  <li><button data-on-click="NewPageInbox">/📧 ${t("Into [Inbox]")}</button></li>
  <li><button data-on-click="NewProject">/✈️ ${t("Page-Tag")} [Projects]</button></li> 
  </ul>
  <hr/>
  <p title=""><small>⚓ ${t("Quickly PARA method Plugin")}</small> | <a data-on-click="PARAsettingButton" title="${t("Plugin Settings")}">⚙️</a> | <small><a href="https://github.com/YU000jp/logseq-plugin-quickly-para-method" title="(Github link)" target="_blank">GitHub</a></small></p>
  </div>
  `

  logseq.provideUI({
    key: "openQuickly",
    attrs: {
      title,
    },
    reset: true,
    close: "outside",
    template,
    style: {
      width: "400px",
      maxHeight: "980px",
      left: "unset",
      bottom: "unset",
      right: "1em",
      top: "4em",
      paddingLeft: "1.6em",
      paddingTop: "0.7em",
      backgroundColor: 'var(--ls-primary-background-color)',
      color: 'var(--ls-primary-text-color)',
      boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
    },
  })

  // ボタン操作 (Shiftキーに対応させるため)
  setTimeout(eventListener, 100)

}


// イベントリスナー
const eventListener = () => {
  // それぞれの開くボタン
  openPageButton("pickListOpenButton", "pickListSelect") //この場合だけ、selectの値を取得 (別の場所に書くと、selectの値が取得できない)
  openPageButton("paraOpenButtonProjects", "Projects")
  openPageButton("paraOpenButtonAreas", "Areas of responsibility")
  openPageButton("paraOpenButtonResources", "Resources")
  openPageButton("paraOpenButtonArchives", "Archives")
}

const openPageButton = (elementId: string, value: string) => {
  if (!value) return
  const button = parent.document.getElementById(elementId) as HTMLButtonElement | null
  if (button) {
    button.addEventListener("click", async ({ shiftKey }) => {

      if (value === "pickListSelect") {
        // ピックリストの場合は、selectの値を取得
        const selectValue = (parent.document.getElementById('pickListSelect') as HTMLSelectElement)!.value
        if (selectValue !== "") openPageFromPageName(selectValue, shiftKey)
      } else
        // ピックリスト以外の場合は、valueをそのまま渡す
        if (value !== "") openPageFromPageName(value, shiftKey)

    })
  }
}


// ピックリストの行を作成
const createPickListSelect = (isPage: boolean): string => {
  const pickList = logseq.settings?.pickList?.split("\n") ?? []
  let select = ""
  if (pickList.length === 0) {
    select = `<small>${t("Please set the pick list in the plugin settings.")}</small>`
  } else {
    select = `
      <span>
        <select id="pickListSelect" title="${t("Pick List")}">
          <option value="">${t("Pick List")}</option>
          ${pickList.map((item) => {
      const label = item.length > 14 ? `${item.slice(0, 14)}...` : item
      return `<option value="${item}">${label}</option>`
    }).join("")}
        </select>
      </span>
      <span>
        ${isPage ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="pickListTagSubmitButton">${t("Tag")}</button></small> | ` : ""}
        <small><button id="pickListOpenButton" title="${t("Press Shift key at the same time to open in sidebar")}">${t("Open")}</button></small>
      </span>
    `
  }
  return select
}
