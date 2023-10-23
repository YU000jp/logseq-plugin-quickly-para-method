import { AppUserConfigs, PageEntity, BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { format } from 'date-fns'
import { removePopup } from './lib'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
  


export const addProperties = async (addProperty: string, addType: string) => {
  removePopup()
  if (addProperty === "") return logseq.UI.showMsg(t("Cancel"), "warning") //cancel

  const getCurrent = await logseq.Editor.getCurrentPage() as PageEntity | null
  if (getCurrent) {
    //cancel same page
    if (getCurrent.name === addProperty || getCurrent.originalName === addProperty) return logseq.UI.showMsg(t("No need to tag the current page."), "warning")

    const getCurrentTree = await logseq.Editor.getCurrentPageBlocksTree() as BlockEntity[] | null
    if (getCurrentTree === null) return logseq.UI.showMsg(t("Failed (Can not get the current page)"), "warning")
    await updatePageProperty(addProperty, getCurrent, addType, getCurrentTree[0].uuid)
  }
}

export const updatePageProperty = async (addProperty: string, getCurrent: PageEntity, addType: string, uuid: string) => {
  //INBOXの場合はタグをつけない
  if (addType !== "INBOX") await updateProperties(addProperty, "tags", getCurrent.properties, addType, uuid)
  if ((addType !== "PARA"
    && logseq.settings?.switchRecodeDate === true)
    || (addType === "PARA"
      && logseq.settings?.switchPARArecodeDate === true)) {
    //指定されたPARAページに日付とリンクをつける
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs
    await setTimeout(function () { RecodeDateToPage(preferredDateFormat, addProperty, " [[" + getCurrent.originalName + "]]") }, 300)
  }
  if (addType === "INBOX") logseq.UI.showMsg(t("Into [Inbox]"), "info")
  else logseq.UI.showMsg(`${t("Page-Tag")} ${addProperty}`, "info")
}
export const RecodeDateToPage = async (userDateFormat, targetPageName, pushPageLink) => {
  const blocks = await logseq.Editor.getPageBlocksTree(targetPageName) as BlockEntity[]
  if (blocks) {
    //PARAページの先頭行の下に追記
    let content
    if (logseq.settings!.archivesDone === true && targetPageName === "Archives") content = "DONE [[" + format(new Date(), userDateFormat) + "]]" + pushPageLink
    else content = "[[" + format(new Date(), userDateFormat) + "]]" + pushPageLink

    await logseq.Editor.insertBlock(blocks[0].uuid, content, { sibling: false })
  } else {
    //ページが存在しない場合は作成
    if (await logseq.Editor.createPage(targetPageName, "", { createFirstBlock: true, redirect: true })) await RecodeDateToPage(userDateFormat, targetPageName, pushPageLink)
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
