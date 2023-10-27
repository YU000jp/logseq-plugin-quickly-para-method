import { PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { openPageFromPageName } from './lib'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { el } from 'date-fns/locale'


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
      <li class="para-away"><label><span>/✈️ [Projects]<input id="paraCheckboxP" type="checkbox"/><div id="paraTooltipP"></div></span></label><span>${flagTagButton ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="Projects">🏷️${t("Tag")}</button></small> | ` : ''}<small><button id="paraOpenButtonProjects" title="${t("Press Shift key at the same time to open in sidebar")}">📄${t("Open")}</button></small></span></li>
      <li class="para-away"><label><span>/🏠 [Areas of responsibility]<input id="paraCheckboxAreas" type="checkbox"/><div id="paraTooltipAreas"></div></span></label><span>${flagTagButton ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="AreasOfResponsibility">🏷️${t("Tag")}</button></small> | ` : ''}<small><button id="paraOpenButtonAreas" title="${t("Press Shift key at the same time to open in sidebar")}">📄${t("Open")}</button></small></span></li>
      <li class="para-away"><label><span>/🌍 [Resources]<input id="paraCheckboxR" type="checkbox"/><div id="paraTooltipR"></div></span></label><span>${flagTagButton ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="Resources">🏷️${t("Tag")}</button></small> | ` : ''}<small><button id="paraOpenButtonResources" title="${t("Press Shift key at the same time to open in sidebar")}">📄${t("Open")}</button></small></span></li>
      <li class="para-away"><label><span>/🧹 [Archives]<input id="paraCheckboxA" type="checkbox"/><div id="paraTooltipA"></div></span></label><span>${flagTagButton ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="Archives">🏷️${t("Tag")}</button></small> | ` : ''}<small><button id="paraOpenButtonArchives" title="${t("Press Shift key at the same time to open in sidebar")}">📄${t("Open")}</button></small></span></li>
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
      <li class="para-away"><label><span>/✈️ [Projects]<input id="paraCheckboxP" type="checkbox"/><div id="paraTooltipP"></div></span></label><span><small><button id="paraOpenButtonProjects" title="${t("Press Shift key at the same time to open in sidebar")}">📄${t("Open")}</button></small></span></li>
      <li class="para-away"><label><span>/🏠 [Areas of responsibility]<input id="paraCheckboxAreas" type="checkbox"/><div id="paraTooltipAreas"></div></span></label><span><small><button id="paraOpenButtonAreas" title="${t("Press Shift key at the same time to open in sidebar")}">📄${t("Open")}</button></small></span></li>
      <li class="para-away"><label><span>/🌍 [Resources]<input id="paraCheckboxR" type="checkbox"/><div id="paraTooltipR"></div></span></label><span><small><button id="paraOpenButtonResources" title="${t("Press Shift key at the same time to open in sidebar")}">📄${t("Open")}</button></small></span></li>
      <li class="para-away"><label><span>/🧹 [Archives]<input id="paraCheckboxA" type="checkbox"/><div id="paraTooltipA"></div></span></label><span><small><button id="paraOpenButtonArchives" title="${t("Press Shift key at the same time to open in sidebar")}">📄${t("Open")}</button></small></span></li>
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
  // ツールチップ
  tooltip("paraCheckboxP", "paraTooltipP", "Projects")
  tooltip("paraCheckboxAreas", "paraTooltipAreas", "Areas of responsibility")
  tooltip("paraCheckboxR", "paraTooltipR", "Resources")
  tooltip("paraCheckboxA", "paraTooltipA", "Archives")
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


// ツールチップ
const tooltip = (checkboxEleId, tooltipEleId: string, pageName: string) => {


  const showList = async (tooltip) => {
    // チェックボックスがチェックされたら、ツールチップを表示

    //h2
    const eleH2 = document.createElement("h2") as HTMLHeadingElement
    eleH2.innerText = pageName + " " + t("List")
    eleH2.title = t("Pages tagged with")
    //div
    const eleDiv = document.createElement("div") as HTMLDivElement
    //ul
    const eleUl = document.createElement("ul") as HTMLUListElement


    // ページ名を取得するクエリ

    const queryPageName = pageName.toLowerCase() // ページ名を小文字にする必要がある

    const query = `
    [:find (pull ?p [:block/original-name :block/updated-at])
            :in $ ?name
            :where
            [?t :block/name ?name]
            [?p :block/tags ?t]]
    `
    let result = await logseq.DB.datascriptQuery(query, `"${queryPageName}"`) as any | null
    if (!result) return logseq.UI.showMsg("Cannot get the page name", "error")
    result = result.flat() as { "original-name": string, "updated-at": string }[] | null

    //ページ名の配列にする
    let pageList = result.map((item) => {
      return {
        "original-name": item["original-name"], // ページ名
        "updated-at": item["updated-at"], // 更新日時
      }
    }) as { "original-name": string, "updated-at": string }[]


    if (pageList.length === 0) {
      //このページタグに一致するページは見つかりませんでした。
      eleDiv.innerHTML = t("No pages found for this page tag.")
    } else {

      // ページ名を、日付順に並び替える
      pageList = pageList.sort((a, b) => {
        return a["updated-at"] > b["updated-at"] ? -1 : 1
      })

      //リスト作成、各ページのリンクを作成
      for (const pageName of pageList) {
        if (!pageName) continue
        const name = pageName["original-name"]
        const eleA = document.createElement("a") as HTMLAnchorElement
        //文字数は14文字までに制限
        eleA.innerText = name.length > 34 ? `${name.slice(0, 34)}...` : name
        eleA.dataset.pageName = name
        const updated = new Date(pageName["updated-at"]).toLocaleString()
        //Shiftキー
        eleA.title = `"${pageName['original-name']}"\n\n(${t("Updated at")}: ${updated})\n`
        const eleLi = document.createElement("li") as HTMLLIElement
        eleLi.append(eleA)
        eleUl.append(eleLi)
        setTimeout(() => {
          // リンクをクリックしたら、ページを開く
          eleA.addEventListener("click", function (this, { shiftKey }) {
            openPageFromPageName(this.dataset.pageName as string, shiftKey)
          })
        }, 100)
      }

      eleDiv.append(eleUl) //ulをdivに追加
    }

    tooltip.innerHTML = "" // ツールチップを空にする
    tooltip.append(eleH2, eleDiv) // ツールチップにエレメントを追加
  }



  const tooltipCheckbox = parent.document.getElementById(checkboxEleId) as HTMLInputElement | null
  if (tooltipCheckbox) {
    tooltipCheckbox.addEventListener("change", async () => {
      const tooltip = parent.document.getElementById(tooltipEleId) as HTMLDivElement | null
      if (!tooltip) return
      if (tooltipCheckbox.checked) {
        // labelタグ連携で、チェックボックスがチェックされたら、ツールチップを表示
        tooltip.innerHTML = t("Loading...")
        tooltip.title = ""
        showList(tooltip)
      }
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
          <option value="">${t("🗒️ Pick List")}</option>
          ${pickList.map((item) => {
      const label = item.length > 14 ? `${item.slice(0, 14)}...` : item
      return `<option value="${item}">${label}</option>`
    }).join("")}
        </select>
      </span>
      <span>
        ${isPage ? `<small><button title="${t("Tag the current page (tags property)")}" data-on-click="pickListTagSubmitButton">🏷️${t("Tag")}</button></small> | ` : ""}
        <small><button id="pickListOpenButton" title="${t("Press Shift key at the same time to open in sidebar")}">📄${t("Open")}</button></small>
      </span>
    `
  }
  return select
}
