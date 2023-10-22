import { AppUserConfigs, PageEntity, BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { format } from 'date-fns'
import { getPageEntityFromBlockUuid, removePopup } from './lib'
import { key } from '.'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n


export const FromSlashCommand = async (uuid: string, addProperty: string, addType: string) => {
  //右サイドバーに開いたブロックからスラッシュコマンドを実行した場合の処理
  const page = await getPageEntityFromBlockUuid(uuid) as PageEntity | null
  if (page) {
    //cancel same page
    if (page.originalName === addProperty) return logseq.UI.showMsg(t("Need not add current page to page-tags."), "warning")
    //INBOXを覗いてジャーナルはキャンセル
    if (addType !== "INBOX" && page['journal?'] === true) return logseq.UI.showMsg(t("Can not add journal page to page-tags."), "warning")
    const getCurrentTree = await logseq.Editor.getPageBlocksTree(page.originalName) as BlockEntity[] | null
    if (getCurrentTree) await updatePageProperty(addProperty, page, addType, getCurrentTree[0].uuid)
  }
}

export const openPARAfromToolbar = async () => {

  const SelectionList = logseq.settings!.selectionList.split(",")
  //selectを作成
  let select = `<select id="selectionListSelect" title="${t("User Selection List")}">`
  //Select hereの選択肢を作成
  select += `<option>${("Select here")}</option>`
  for (let i = 0; i < SelectionList.length; i++) {
    if (SelectionList[i] !== "") select += `<option value="${SelectionList[i]}">${SelectionList[i]}</option>`
  }
  select += `</select>`
  //selectの後ろに送信ボタン
  select += `<button data-on-click="selectionListSendButton">${t("Submit")}</button>`
  let template = ""
  let height = ""
  const getPage = await logseq.Editor.getCurrentPage() as PageEntity | null
  if (getPage) {
    template = `
  <div title="">
  <p title="${t("The title of current page")}">[[${getPage.originalName}]]<button data-on-click="copyPageTitleLink" title="${t("Copy to clipboard")}">📋</button></p>
  <ul>
  <li><button data-on-click="Inbox">${t("/📧 Put inside [[Inbox]])")}</button></li>
  <h2>${t("Set page-tags property")}</h2>

  <li>${select}</li>
  `
    if (getPage.originalName === "Projects" || getPage.originalName === "Areas of responsibility" || getPage.originalName === "Resources" || getPage.originalName === "Archives") {
      //not show
    } else {
      template += `
  <li><button data-on-click="Projects">${t("/✈️ As [[Projects]]")}</button></li>
  <li><button data-on-click="AreasOfResponsibility">${t("/🏠 As [[Areas of responsibility]]")}</button></li>
  <li><button data-on-click="Resources">${t("/🌍 As [[Resources]]")}</button></li>
  <li><button data-on-click="Archives">${t("/🧹As [[Archives]]")}</button></li>
  `
    }
    template += `
  </ul>
  <hr/>
      `
    height = "690px"
  } else {
    template = `
    <div title="">
    `
    height = "330px"
  }
  template += `
  <ul>
  <h2>${t("Shortcut menu")}</h2>
  <h3>Create new page</h3>
  <li><button data-on-click="NewPageInbox">${t("/📧 And put inside [[Inbox]]")}</button></li>
  <li><button data-on-click="NewProject">${t("/✈️ And put inside [[Projects]]")}</button></li> 
  </ul>
  <hr/>
  <ul>
  <li><button data-on-click="PARAsettingButton"><small>${t("Plugin Settings")}</small></button></li>
  <li><a href="https://github.com/YU000jp/logseq-plugin-quickly-para-method" title="(Github link)" target="_blank">⚓ ${t("Quickly PARA method Plugin")}</a></li>
  </ul>
  </div>
  `

  logseq.provideUI({
    key,
    reset: true,
    close: "outside",
    template,
    style: {
      width: "400px",
      height,
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

export const createPageFor = async (name: string, icon: string, para: boolean) => {
  const getPage = await logseq.Editor.getPage(name) as PageEntity | null
  if (getPage === null) {
    if (para === true) {
      logseq.Editor.createPage(name, { icon, tags: "The PARA Method" }, { createFirstBlock: true, })
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
        <p>New Page Title: <input id="newPageTitle" type="text" style="width:340px"/>
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
        const obj = await logseq.Editor.getPage(inputTitle) as PageEntity | null //ページチェック
        if (obj === null) { //ページが存在しないことを確認する
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

export const addProperties = async (addProperty: string, addType: string) => {
  removePopup()
  if (addProperty === "") return logseq.UI.showMsg(`Cancel`, "warning") //cancel

  const getCurrent = await logseq.Editor.getCurrentPage() as PageEntity | null
  if (getCurrent) {
    //cancel same page
    if (getCurrent.name === addProperty || getCurrent.originalName === addProperty) return logseq.UI.showMsg(t("Need not add current page to page-tags."), "warning")

    const getCurrentTree = await logseq.Editor.getCurrentPageBlocksTree() as BlockEntity[] | null
    if (getCurrentTree === null) return logseq.UI.showMsg(t("Failed (Can not get the current page)"), "warning")
    await updatePageProperty(addProperty, getCurrent, addType, getCurrentTree[0].uuid)
  }
}

const updatePageProperty = async (addProperty: string, getCurrent: PageEntity, addType: string, uuid: string) => {
  //INBOXの場合はタグをつけない  
  if (addType !== "INBOX") await updateProperties(addProperty, "tags", getCurrent.properties, addType, uuid)
  if ((addType !== "PARA" && logseq.settings?.switchRecodeDate === true)
    || (addType === "PARA" && logseq.settings?.switchPARArecodeDate === true)) { //指定されたPARAページに日付とリンクをつける
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs
    await setTimeout(function () { RecodeDateToPage(preferredDateFormat, addProperty, " [[" + getCurrent.originalName + "]]") }, 300)
  }
  if (addType !== "INBOX") {
    logseq.UI.showMsg(`As ${addProperty}`, "info") // TODO:
  } else {
    logseq.UI.showMsg(`Add to ${addProperty}`, "info") // TODO: 
  }
}

const RecodeDateToPage = async (userDateFormat, targetPageName, pushPageLink) => {
  const blocks = await logseq.Editor.getPageBlocksTree(targetPageName) as BlockEntity[]
  if (blocks) {
    //PARAページの先頭行の下に追記
    let content
    if (logseq.settings!.archivesDone === true && targetPageName === "Archives") {
      content = "DONE [[" + format(new Date(), userDateFormat) + "]]" + pushPageLink
    } else {
      content = "[[" + format(new Date(), userDateFormat) + "]]" + pushPageLink
    }
    await logseq.Editor.insertBlock(blocks[0].uuid, content, { sibling: false })
  } else {
    //ページが存在しない場合は作成
    const createPage = await logseq.Editor.createPage(targetPageName, "", { createFirstBlock: true, redirect: true })
    if (createPage) {
      await RecodeDateToPage(userDateFormat, targetPageName, pushPageLink)
    }
  }
}

const updateProperties = async (addProperty: string, targetProperty: string, PageProperties, addType: string, firstBlockUUID: string) => {
  let editBlockUUID
  let deleteArray = ['Projects', 'Resources', 'Areas of responsibility', 'Archives']
  if (PageProperties !== null) {
    if (typeof PageProperties === "object") { //ページプロパティが存在した場合
      for (const [key, value] of Object.entries(PageProperties)) { //オブジェクトのキーに値がない場合は削除
        if (!value) delete PageProperties[key]
      }
      if (addType === "PARA") deleteArray = deleteArray.filter(element => element !== addProperty) //PARA: 一致するもの以外のリスト
      let PropertiesArray = PageProperties[targetProperty] || []
      if (PropertiesArray) {
        if (addType === "PARA") PropertiesArray = PropertiesArray.filter(property => !deleteArray.includes(property)) //PARA: タグの重複削除
        PropertiesArray = [...PropertiesArray, addProperty]
      } else {
        PropertiesArray = [addProperty]
      }
      PropertiesArray = [...new Set(PropertiesArray)] //タグの重複削除
      await logseq.Editor.upsertBlockProperty(firstBlockUUID, targetProperty, PropertiesArray)
      editBlockUUID = firstBlockUUID
    } else { //ページプロパティが存在しない
      const prependProperties = {}
      prependProperties[targetProperty] = addProperty
      const prepend = await logseq.Editor.insertBlock(firstBlockUUID, "", { properties: prependProperties, sibling: true, before: true, isPageBlock: true, focus: true })
      if (prepend) {
        await logseq.Editor.moveBlock(prepend.uuid, firstBlockUUID, { before: true, children: true })
        editBlockUUID = prepend.uuid
      }
    }
    await logseq.Editor.editBlock(editBlockUUID)
    setTimeout(function () {
      logseq.Editor.insertAtEditingCursor(",") //ページプロパティを配列として読み込ませる処理
      setTimeout(async function () {
        const property = await logseq.Editor.getBlockProperty(editBlockUUID, "icon") as string | null
        if (property) {
          //propertyから「,」をすべて取り除く
          property.replace(/,/g, "")
          await logseq.Editor.upsertBlockProperty(editBlockUUID, "icon", property)
          let tagsProperty = await logseq.Editor.getBlockProperty(editBlockUUID, "tags") as string | null
          if (tagsProperty) {
            //tagsPropertyの最後に「,」を追加
            await logseq.Editor.upsertBlockProperty(editBlockUUID, "tags", tagsProperty)
            logseq.Editor.insertAtEditingCursor(",") //ページプロパティを配列として読み込ませる処理
          }
        }
      }, 200)
    }, 200)
  }
  return editBlockUUID
}
