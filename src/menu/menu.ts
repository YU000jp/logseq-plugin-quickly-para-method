import { AppUserConfigs, BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { format, parse } from 'date-fns'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { advancedQuery, queryCodeUpdatedAtFromPageName } from '../batchTileView/embed/advancedQuery'
import { guardDbGraph } from '../logseqDbGraphCheck'
import { openPageFromPageName } from './../lib'
import { pageTitleSlash } from './lib'

let flagNamespace: boolean = false // ページ名に階層が含まれる場合のフラグ

// ツールバーからPARAメニューを開く
export const openMenuFromToolbar = async () => {
  if (guardDbGraph()) return
  let template = "" // テンプレート(HTML)用
  let title = "" // タイトル用
  let namespace = "" // namespace用
  // 現在のページを取得
  const getPage = await logseq.Editor.getCurrentPage() as PageEntity | null
  if (getPage) {

    // ページが存在する場合
    title = getPage.originalName
    // PARAページに該当する場合のフラグ
    const flagPARA = title === "Projects"
      || title === "Areas of responsibility"
      || title === "Resources"
      || title === "Archives"
      ? true : false
    // タグボタンの表示は、Journalページではなく、paraページでもない場合のみ
    const flagTagButton: boolean = getPage['journal?'] === false && flagPARA === false

    // ページ名に階層が含まれる場合は、階層を削除したページ名を表示する
    let printNamespace = ""
    flagNamespace = title.includes("/") as boolean

    namespace = flagNamespace ?
      title.split("/").slice(-1)[0] //階層が含まれる場合
      : title //階層が含まれない場合
    const printCopyButton = `<button data-on-click="copyPageTitleLink" title="${t("Copy current full page name to clipboard")}">📋</button>`
    if (flagNamespace) {
      const pageCheck = await logseq.Editor.getPage(namespace) as PageEntity | null
      //ページ名を省略する
      const titleString = (namespace.length > 28 ? `${namespace.slice(0, 28)}...` : namespace).replaceAll("/", " / ")

      printNamespace = `<li class="para-away"><label title="<Namespace> ${t("Open the list")}"><span style="font-size:.88em"><span class="tabler-icons">&#xee17;</span> ${titleString}<input id="paraCheckboxNamespace" type="checkbox"/><div id="paraTooltipNamespace" data-namespace="${namespace}"></div></span></label><span>${//ページが存在する場合とそうでない場合
        pageCheck ?
          // ページが存在する場合
          //タグ、開くボタンを表示する
          `${printCopyButton}<button data-on-click="namespaceNewPage" data-namespace="${namespace}" data-old="${title}" title="${t("Tag")} '${namespace}'">🏷️</button><button id="paraOpenButtonNamespace" title="${t("Press Shift key at the same time to open in sidebar")}" data-namespace="${namespace}">📄</button></span></li>`
          :
          //  ページが存在しない場合
          //タグ、開くボタンを表示しない
          `<button data-on-click="namespaceNewPage" data-namespace="${namespace}" data-old="${title}" title="${t("New page using the sub page name (namespace)")}\n'${namespace}'"><span class="tabler-icons">&#xeaa0;</span></button>${printCopyButton}</span></li>`
        }`
    } else {
      // 階層が含まれない場合
      //タグ、開くボタンを表示しない
      printNamespace = `<li class="para-away"><label title="${t("Open the list")}"><span style="font-size:.88em"><span class="tabler-icons">&#xee17;</span> ${namespace}<input id="paraCheckboxNamespace" type="checkbox"/><div id="paraTooltipNamespace" data-namespace="${namespace}"></div></span></label><span>${printCopyButton}</span></li>`
    }
    template = `
  <div style="user-select: none" title="">
    <ul>
      <li style="margin-top:.6em" class="para-away">${createPickListSelect(flagTagButton)}</li>
      ${printNamespace}
      <hr/>
      <li class="para-away"><label title="${t("Open the list")}"><span>✈️ Projects<input id="paraCheckboxP" type="checkbox"/><div id="paraTooltipP"></div></span></label><span>${flagTagButton ? `<button title="${t("Tag the current page (Page-tag)")}" data-on-click="Projects">🏷️</button>` : ''}<button id="paraOpenButtonProjects" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button></span></li>
      <li class="para-away"><label title="${t("Open the list")}"><span>🏠 Areas of responsibility<input id="paraCheckboxAreas" type="checkbox"/><div id="paraTooltipAreas"></div></span></label><span>${flagTagButton ? `<button title="${t("Tag the current page (Page-tag)")}" data-on-click="AreasOfResponsibility">🏷️</button>` : ''}<button id="paraOpenButtonAreas" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button></span></li>
      <li class="para-away"><label title="${t("Open the list")}"><span>🌍 Resources<input id="paraCheckboxR" type="checkbox"/><div id="paraTooltipR"></div></span></label><span>${flagTagButton ? `<button title="${t("Tag the current page (Page-tag)")}" data-on-click="Resources">🏷️</button>` : ''}<button id="paraOpenButtonResources" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button></span></li>
      <li class="para-away"><label title="${t("Open the list")}"><span>🧹 Archives<input id="paraCheckboxA" type="checkbox"/><div id="paraTooltipA"></div></span></label><span>${flagTagButton ? `<button title="${t("Tag the current page (Page-tag)")}" data-on-click="Archives">🏷️</button>` : ''}<button id="paraOpenButtonArchives" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button></span></li>
    </ul>
    <hr/>
      `
  } else {

    // ページが存在しない場合
    title = "⚓"
    template = `
    <div title="" style="user-select: none" title="">
    <ul>
      <li style="margin-top:.6em" class="para-away">${createPickListSelect(false)}</li>
      <hr/>
      <li class="para-away"><label title="${t("Open the list")}"><span>✈️ Projects<input id="paraCheckboxP" type="checkbox"/><div id="paraTooltipP"></div></span></label><span><button id="paraOpenButtonProjects" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button></span></li>
      <li class="para-away"><label title="${t("Open the list")}"><span>🏠 Areas of responsibility<input id="paraCheckboxAreas" type="checkbox"/><div id="paraTooltipAreas"></div></span></label><span><button id="paraOpenButtonAreas" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button></span></li>
      <li class="para-away"><label title="${t("Open the list")}"><span>🌍 Resources<input id="paraCheckboxR" type="checkbox"/><div id="paraTooltipR"></div></span></label><span><button id="paraOpenButtonResources" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button></span></li>
      <li class="para-away"><label title="${t("Open the list")}"><span>🧹 Archives<input id="paraCheckboxA" type="checkbox"/><div id="paraTooltipA"></div></span></label><span><button id="paraOpenButtonArchives" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button></span></li>
    </ul>
    <hr/>
    `
  }

  template += `
    <ul title="" id="para-menu-combination">
      <h2>${t("Combination Menu")}</h2>
      <h3>${t("New page")} +</h3>
      <li class="para-away">
        <label><span class="not-cursor-pointer"><span class="tabler-icons">&#xee0d;</span> <small>(${t("Top level")})</small></span></label>
        <span>
        <button data-on-click="NewPage" data-same-level="" title="${t("Top level")} > ${t("New page")}"><span class="tabler-icons">&#xeaa0;</span></button><button data-on-click="NewProject" title="${t("Top level")} > ${t("Page-Tag")} [Projects]">✈️</button>
        </span>
      </li>
      `
  let sameLevel = ""
  if (flagNamespace) {
    sameLevel = title.split("/").slice(0, -1).join("/")
    template += `
      <li class="para-away">
        <label><span class="not-cursor-pointer" title="${t("Same level")}"><span class="tabler-icons">&#xee17;</span> ${sameLevel.replaceAll("/", " / ")}</span></label>
        <span>
          <button id="paraOpenButtonSameLevel" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button><button data-on-click="NewPage" data-same-level="${sameLevel}" title="${t("Same level")} > ${t("New page")}"><span class="tabler-icons">&#xeaa0;</span></button><button data-on-click="NewProject" title="${t("Same level")} > ${t("Page-Tag")} [Projects]" data-same-level="${sameLevel}">✈️</button>
      </li>
      `
  }
  if (title !== undefined && title !== "⚓") {
    template += `
      <li class="para-away">
        <label><span class="not-cursor-pointer" title="${t("Sub page")}"><span class="tabler-icons">&#xee17;</span> ${title.replaceAll("/", " / ")} /</span></label>
        <span>
          <button data-on-click="NewPage" data-same-level="${title}/" title="${t("Sub page")} > ${t("New page")}"><span class="tabler-icons">&#xeaa0;</span></button><button data-on-click="NewProject" title="${t("Sub page")} > ${t("Page-Tag")} [Projects]" data-same-level="${title}/">✈️</button>
        </span>
      </li> 
            `
  }
  template += `
    </ul>
    <hr/>
    <p title=""><small>⚓ Quickly PARA method ${t("Plugin")}</small> | <a data-on-click="PARAsettingButton" title="${t("Plugin settings")}"><span class="tabler-icons">&#xeb20;</span></a> | <a href="https://github.com/YU000jp/logseq-plugin-quickly-para-method" title="(Github link)" target="_blank""><small>GitHub</smalL> <span class="tabler-icons">&#xec1c;</span></a></p>
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
      paddingLeft: "1em",
      paddingTop: "0.7em",
      backgroundColor: 'var(--ls-primary-background-color)',
      color: 'var(--ls-primary-text-color)',
      boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
    },
  })

  // ボタン操作 (Shiftキーに対応させるため)
  setTimeout(() => eventListener({
    namespace,
    sameLevel,
    title
  }), 100)

}


// イベントリスナー
const eventListener = (get: {
  namespace: string
  sameLevel: string
  title: string
}) => {
  // それぞれの開くボタン
  if (flagNamespace) openPageButton("paraOpenButtonNamespace", get.namespace) // namespaceの場合は、data-namespaceの値を取得
  openPageButton("pickListOpenButton", "pickListSelect", { pickListSelect: true }) //selectの値を取得 (別の場所に書くと、selectの値が取得できない)
  openPageButton("paraOpenButtonProjects", "Projects")
  openPageButton("paraOpenButtonAreas", "Areas of responsibility")
  openPageButton("paraOpenButtonResources", "Resources")
  openPageButton("paraOpenButtonArchives", "Archives")
  if (get.sameLevel) openPageButton("paraOpenButtonSameLevel", get.sameLevel) // 同じ階層
  // ツールチップ
  tooltip("<span class=\"tabler-icons\">&#xee17;</span>", "paraCheckboxNamespace", "paraTooltipNamespace", get.namespace, { namespace: true })
  tooltip("✈️", "paraCheckboxP", "paraTooltipP", "Projects")
  tooltip("🏠", "paraCheckboxAreas", "paraTooltipAreas", "Areas of responsibility")
  tooltip("🌍", "paraCheckboxR", "paraTooltipR", "Resources")
  tooltip("🧹", "paraCheckboxA", "paraTooltipA", "Archives")
}

const openPageButton = (
  elementId: string,
  pageName: string,
  flag?: {
    pickListSelect?: boolean,
  }) => {
  // namespaceやpickListSelectの場合は、個別に値を取得する

  if (!pageName) return
  const button = parent.document.getElementById(elementId) as HTMLButtonElement | null
  if (button) {
    button.addEventListener("click", async ({ shiftKey }) => {

      if (flag && flag.pickListSelect === true) {
        // ピックリストの場合は、selectの値を取得
        const selectValue = (parent.document.getElementById('pickListSelect') as HTMLSelectElement)!.value
        if (selectValue !== "") openPageFromPageName(selectValue, shiftKey)
      } else
        // ピックリスト以外の場合は、pageNameをそのまま渡す
        if (pageName !== "") openPageFromPageName(pageName, shiftKey)

    })
  }
}


// ツールチップ
const tooltip = (
  titleIcon: string,
  checkboxEleId: string,
  tooltipEleId: string,
  pageName: string,
  flag?: {
    namespace?: boolean,
  }) => {


  const showList = tooltipCreateList(titleIcon, pageName, flag)



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
  const pickList = (logseq.settings?.pickList as string).split("\n") ?? []
  let select = ""
  if (pickList.length === 0) {
    select = `<small>${t("Please set the pick list in the plugin settings.")}</small>`
  } else {
    select = `
      <label><span>
        <select id="pickListSelect" title="${t("Pick List")}">
          <option value=""><span class="tabler-icons">&#xeb1d;</span> ${t("Pick List")}</option>
          ${pickList.map((item) => {
      const label = item.length > 14 ? `${item.slice(0, 14)}...` : item
      return `<option value="${item}">${label}</option>`
    }).join("")}
        </select>
      </span></label>
      <span>
        ${isPage ? `<button title="${t("Tag the current page (Page-tag)")}" data-on-click="pickListTagSubmitButton">🏷️</button>` : ""}<button id="pickListOpenButton" title="${t("Press Shift key at the same time to open in sidebar")}">📄</button>
      </span>
    `
  }
  return select
}


const tooltipCreateList = (
  titleIcon: string,
  pageName: string,
  flag?: {
    namespace?: boolean,
  }) => {
  return async (tooltip: HTMLDivElement) => {
    // チェックボックスがチェックされたら、ツールチップを表示
    //h2
    const eleH2 = document.createElement("h2") as HTMLHeadingElement
    //div
    const eleDiv = document.createElement("div") as HTMLDivElement


    if (flag && flag.namespace === true) {
      //namespaceの場合

      //data - namespaceの値を取得
      const namespace = pageName
      if (!namespace) return logseq.UI.showMsg("Cannot get the page name", "warning")


      //logseq.UI.showMsg(namespace, "info")

      const queryPageName = namespace.toLowerCase() // クエリーでは、ページ名を小文字にする必要がある

      //同じ名前をもつページ名を取得するクエリー
      const query = `
      [:find (pull ?p [:block/original-name])
              :in $ ?pattern
              :where
              [?p :block/name ?c]
              [(re-pattern ?pattern) ?q]
              [(re-find ?q ?c)]
      ]
      `
      let result = (await logseq.DB.datascriptQuery(query, `"${queryPageName}"`) as any | null)?.flat() as {
        "original-name": string
      }[] | null
      if (!result) return logseq.UI.showMsg("Cannot get the page name", "error")

      //resultの中に、nullが含まれている場合があるので、nullを除外する
      result = result.filter((item) => item !== null)


      if (result.length === 0) {
        //このページ名に関連するページは見つかりませんでした。
        eleDiv.innerHTML = t("No pages found for this page name.")
        return tooltip.append(eleH2, eleDiv)
      }

      // ページ名を、名称順に並び替える
      eleDiv.title = t("order by name")
      eleH2.title = t("order by name")
      result = result.sort((a, b) => {
        return a["original-name"] > b["original-name"] ? 1 : -1
      })


      //h2
      eleH2.innerHTML = `${titleIcon} ' ${namespace} ' ${t("List")}`

      // ページ名を表示する
      const eleUl = document.createElement("ul") as HTMLUListElement
      for (const page of result) {
        // original-nameを取得
        let pageName = page['original-name']
        // ec7fbafb-4e59-44a6-9927-ac34d099f085
        // このようなUuidが含まれる場合
        if (pageName.match(/^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$/)) {
          // ブロックを取得
          const page = await logseq.Editor.getPage(pageName) as PageEntity | null
          if (!page) continue
          pageName = page.originalName as string
        }
        // 表示用にページ名を短縮する
        if (!pageName) continue
        let pageNameString = pageTitleSlash(pageName)

        const eleLi = document.createElement("li") as HTMLLIElement
        const aEle = document.createElement("a") as HTMLAnchorElement
        aEle.dataset.pageName = pageName
        aEle.title = pageName
        aEle.innerText = pageNameString
        aEle.id = `para-tooltip-namespace--${pageName}`
        eleLi.append(aEle)
        eleUl.append(eleLi)
        setTimeout(() => {
          parent.document.getElementById(aEle.id)?.addEventListener("click", function (this, { shiftKey }) {
            openPageFromPageName(this.dataset.pageName as string, shiftKey)
          })
        }, 100)
      }
      eleDiv.append(eleUl)

      //hr
      eleDiv.innerHTML += "<hr/>"
      // 「ページ名に同じ名称を含んでいるページを一覧表示します」という内容でメッセージを表示する
      eleDiv.innerHTML += `<p><small>${t("Pages that contain the same name as the page name are displayed.")}</small></p>`


      //end of namespace
    } else {

      //ページタグを一覧表示する (PARAの場合)


      eleH2.innerHTML = `${titleIcon} ' ${pageName} ' <small>${t("List")}</small>`
      eleH2.title = t("in order of update") + " > " + t("Pages tagged with")
      const queryPageName = pageName.toLowerCase() // クエリーでは、ページ名を小文字にする必要がある

      //logseq.UI.showMsg(pageName, "info")


      // ページ名と更新日時を取得するクエリ

      let result = await advancedQuery(queryCodeUpdatedAtFromPageName, `"${queryPageName}"`) as {
        "original-name": string
        "updated-at": string
      }[] | null
      if (!result)
        return logseq.UI.showMsg("Cannot get the page name", "warning")

      //resultの中に、nullが含まれている場合があるので、nullを除外する
      result = result.filter((item) => item !== null)

      if (result.length === 0)
        //このページタグに一致するページは見つかりませんでした。
        eleDiv.innerHTML = t("No pages found for this page tag.")
      else {

        // ページ名を、日付順に並び替える
        eleDiv.title = t("in order of update")
        result = result.sort((a, b) => {
          return a["updated-at"] > b["updated-at"] ? -1 : 1
        })

        // 日付を月ごとにグループ化するためのオブジェクト
        const pagesByMonth: {
          [key: string]: {
            "original-name": string
            "updated-at": string
          }[]
        } = {}

        // ページ名を月ごとにグループ化する
        for (const page of result) {
          const updatedAt = new Date(page["updated-at"])
          const month = updatedAt.getMonth() + 1 // 月の値を取得
          const monthKey = `${updatedAt.getFullYear()}-${month.toString().padStart(2, "0")}` // キーを作成
          if (!pagesByMonth[monthKey]) {
            pagesByMonth[monthKey] = []
          }
          //original-nameだけでなくupdated-atを追加
          pagesByMonth[monthKey].push(page)
        }

        // 月ごとにページ名を表示する
        for (const monthKey in pagesByMonth) {
          const pages = pagesByMonth[monthKey]
          //年月を取得
          const month = new Date(monthKey).toLocaleDateString("default", { year: "numeric", month: "long" })
          // 更新月
          eleDiv.innerHTML += `<h3>${month}</h3>`
          const eleUl = document.createElement("ul") as HTMLUListElement
          for (const page of pages) {
            const pageName = page['original-name']
            const eleLi = document.createElement("li") as HTMLLIElement
            if (!pageName) continue
            const pageNameString = pageTitleSlash(pageName)
            const createdString = new Date(page['updated-at']).toLocaleDateString("default", { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric" })
            const aEle = document.createElement("a") as HTMLAnchorElement
            aEle.dataset.pageName = pageName
            aEle.title = `${pageName}\n\n${t("update date/time")}: ${createdString}`
            aEle.innerText = pageNameString
            aEle.id = `para-tooltip-page-tag--${pageName}`
            eleLi.append(aEle)
            eleUl.append(eleLi)
            setTimeout(() => {
              parent.document.getElementById(aEle.id)?.addEventListener("click", function (this, { shiftKey }) {
                openPageFromPageName(this.dataset.pageName as string, shiftKey)
              })
            }, 100)
          }
          eleDiv.append(eleUl)
        }
        //hr
        eleDiv.innerHTML += "<hr/>"

        // 「そのタグが付けられたページが一覧表示されています」というメッセージをいれる
        eleDiv.innerHTML += `<p><small>${t("Pages with that tag appear in the list.")}</small></p>`
      }
    } //end of namespace以外


    tooltip.innerHTML = "" // ツールチップを空にする
    tooltip.append(eleH2, eleDiv)
  }
}


