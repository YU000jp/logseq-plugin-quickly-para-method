import { AppUserConfigs, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { removePopup } from './lib'
import { key } from '.'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { RecodeDateToPage } from './property'


export const openPARAfromToolbar = async () => {

  const pickList = logseq.settings!.pickList ? logseq.settings!.pickList.split("\n") : null
  let select = ""
  if (pickList === null) {
    select = `<small>${t("Please set the pick list in the plugin settings.")}</small>`
  } else {
    //selectを作成
    select = `
              <select id="selectionListSelect" title="${t("Pick List")}">
              <option value="">${t("Pick List")}</option>
              `
    for (let i = 0; i < pickList.length; i++) {
      //文字列が12文字を超える場合は、12文字目以降を「...」にする
      const label = pickList[i].length > 14 ? pickList[i].slice(0, 14) + "..." : pickList[i];
      if (pickList[i] !== "") select += `<option value="${pickList[i]}">${label}</option>`
    }
    select += `
              </select>
              <button data-on-click="selectionListSendButton">${t("Tag")}</button>
              `
  }
  let template = ""
  let title = ""
  const getPage = await logseq.Editor.getCurrentPage() as PageEntity | null
  if (getPage) {
    title = getPage.originalName
    template = `
  <div title="" style="user-select: none">
  <ul>
  <li><button data-on-click="copyPageTitleLink">📋 ${t("Copy the page name to clipboard")}</button></li>
  <li><button data-on-click="Inbox">/📧 ${t("Into [Inbox]")}</button></li>
  <li style="margin-top:.6em">${select}</li>
  `
    if (getPage['journal?'] === false) {
      if (getPage.originalName === "Projects"
        || getPage.originalName === "Areas of responsibility"
        || getPage.originalName === "Resources"
        || getPage.originalName === "Archives"
        || getPage.originalName === "Inbox"
      ) {
        //not show

      } else {
        template += `
        <hr/>
        <li>/✈️ [Projects] <button data-on-click="Projects">${t("Tag")}</button></li>
        <li>/🏠 [Areas of responsibility] <button data-on-click="AreasOfResponsibility">${t("Tag")}</button></li>
        <li>/🌍 [Resources] <button data-on-click="Resources">${t("Tag")}</button></li>
        <li>/🧹 [Archives] <button data-on-click="Archives">${t("Tag")}</button></li>
        `
      }
      template += `
  </ul>
  <hr/>
      `
    }
  } else {
    title = "⚓"
    template = `
    <div title="">
    <p><small>${t("If not journals, more menus will be displayed.")}</small></p>
    <hr/>
    `
  }
  template += `
  <ul>
  <h2>${t("Combination Menu")}</h2>
  <h3>${t("New page")} +</h3>
  <li><button data-on-click="NewPageInbox">/📧 ${t("Into [Inbox]")}</button></li>
  <li><button data-on-click="NewProject">/✈️ ${t("Page-Tag")} [Projects]</button></li> 
  </ul>
  <hr/>
  <p><small>⚓ ${t("Quickly PARA method Plugin")}</small> | <a data-on-click="PARAsettingButton" title="${t("Plugin Settings")}">⚙️</a> | <small><a href="https://github.com/YU000jp/logseq-plugin-quickly-para-method" title="(Github link)" target="_blank">GitHub</a></small></p>
  </div>
  `

  logseq.provideUI({
    key,
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
}

export const createPageForPARA = async (name: string, icon: string, para: boolean) => {
  const getPage = await logseq.Editor.getPage(name) as PageEntity | null
  if (getPage === null) {
    if (para === true) {
      logseq.Editor.createPage(name, { icon, tags: t("[[The PARA Method]]") }, { createFirstBlock: true, }) //PARAページの作成、タグをつける
    } else {
      logseq.Editor.createPage(name, { icon, }, { createFirstBlock: true, })
    }
  }
}

export const createNewPageAs = async (title: string, tags: string) => {
  logseq.provideUI({
    attrs: {
      title,
    },
    key,
    reset: true,
    template: `
        <p>${t("New Page Title")}: <input id="newPageTitle" type="text" style="width:340px"/>
        <button id="CreatePageButton">${t("Submit")}</button></p>
        `,
    style: {
      width: "640px",
      height: "150px",
      left: "unset",
      bottom: "unset",
      right: "1em",
      top: "4em",
      paddingLeft: "1.8em",
      paddingTop: "1.4em",
      backgroundColor: 'var(--ls-primary-background-color)',
      color: 'var(--ls-primary-text-color)',
      boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
    },
  })
  setTimeout(() => {
    const button = parent.document.getElementById("CreatePageButton") as HTMLButtonElement
    if (button) {
      let processing: Boolean = false
      button.addEventListener("click", async () => {
        if (processing) return
        processing = true
        const inputTitle = (parent.document.getElementById("newPageTitle") as HTMLInputElement).value
        if (!inputTitle) {
          processing = false
          return
        }
        if ((await logseq.Editor.getPage(inputTitle) as PageEntity | null) === null) { //ページが存在しないことを確認する
          const createPage = await logseq.Editor.createPage(inputTitle, "", { createFirstBlock: false, redirect: true })
          if (createPage) {
            const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs
            await RecodeDateToPage(preferredDateFormat, tags, " [[" + createPage.originalName + "]]")
            //ページプロパティの指定
            if (tags !== "Inbox") {
              const prepend = await logseq.Editor.prependBlockInPage(createPage.uuid, "", { properties: { tags } })
              if (prepend) {
                await logseq.Editor.editBlock(prepend.uuid).catch(async () => {
                  await setTimeout(function () {
                    //ページプロパティを配列として読み込ませる処理
                    logseq.Editor.insertAtEditingCursor(",")
                    logseq.Editor.openInRightSidebar(createPage.uuid)
                    logseq.UI.showMsg(t("Create a new page"), "success")
                  }, 200)
                })
              }
            }
          }
        } else { //ページが存在していた場合
          logseq.Editor.openInRightSidebar(inputTitle)
          logseq.UI.showMsg(t("The Page already exists"), "warning")
        }

        //実行されたらポップアップを削除
        removePopup()
        processing = false
      })
    }
  }, 100)
}

