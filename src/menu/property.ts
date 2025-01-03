import { AppUserConfigs, BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { RecodeDateToPageTop } from '../menu/RecodePageTop'
import { removePopup } from '../lib'


/**
 * コマンドを実行する (チェックをおこなう)
 * @param addPropPageName 追加するページ名 ( [[ ]]なし )
 * @param addPropName 追加するプロパティ名
 */
export const runCommand = async (addPropPageName: string, addPropName: string) => {

  // 追加するプロパティが空の場合はキャンセルとする
  if (addPropPageName === "")
    return logseq.UI.showMsg(t("Cancel"), "warning")

  // 現在のページを取得する
  const getCurrent = await logseq.Editor.getCurrentPage() as { name: PageEntity["name"]; properties: PageEntity["properties"], originalName: PageEntity["originalName"] } | null
  if (getCurrent) {
    // 現在のページと同じ名前のプロパティを追加しようとした場合はキャンセルとする
    if (getCurrent.name === addPropPageName
      || getCurrent.originalName === addPropPageName)
      return logseq.UI.showMsg(t("No need to tag the current page"), "warning")

    // 現在のページのブロックツリーを取得する
    const getCurrentTree = await logseq.Editor.getCurrentPageBlocksTree() as BlockEntity[] | null
    if (getCurrentTree === null)
      return logseq.UI.showMsg("Can not get the current page", "warning")

    // ポップアップを削除
    removePopup()

    // ページにプロパティを追加する
    await updatePageProperty(addPropPageName, getCurrent, addPropName, getCurrentTree[0].uuid)

  }
}


/**
 * ページにプロパティを追加し、必要に応じて日付を記録する
 * @param addPropPageName 追加するページ名 ( [[ ]]なし )
 * @param targetPageEntity ターゲットのPageEntity
 * @param type 追加するプロパティのタイプ (PARA、Free)
 * @param uuid ページの最初のブロックのUUID
 */
export const updatePageProperty = async (addPropPageName: string, targetPageEntity: { properties: PageEntity["properties"], originalName: PageEntity["originalName"] }, type: string, uuid: string) => {

  const message = () => {
    logseq.UI.showMsg(`${t("Page-Tag")} ${addPropPageName}`, "info", { timeout: 3000 })
  }
  // ページプロパティに追加
  if ((type !== "PARA")
    || (type === "PARA" && logseq.settings!.booleanRecodeOnly === false))
    await updatePageProperties(addPropPageName, "tags", targetPageEntity.properties, type, uuid)

  // ページ先頭にログを追加
  if (type === "PARA" // PARAページ
    && logseq.settings?.switchPARArecodeDate === true) {
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs
    setTimeout(async () => {
      const success: boolean = await RecodeDateToPageTop(preferredDateFormat, addPropPageName, " [[" + targetPageEntity.originalName + "]]")
      if (success)
        message()
    }, 300)
  } else
    // 成功した場合のメッセージを表示
    message()
}

/**
 * ページのプロパティを更新する。反映処理も行う。
 * @param addPropPageName 追加するページ名 ( [[ ]]なし )
 * @param targetProperty 更新するプロパティ名
 * @param properties ページのプロパティ
 * @param type タイプ PARA
 * @param firstBlockUuid ページの最初のブロックのUUID
 */
const updatePageProperties = (addPropPageName: string, targetProperty: string, properties, type: string, firstBlockUuid: string) => {

  // 削除するプロパティのリスト
  let deleteArray = ['Projects', 'Resources', 'Areas of responsibility', 'Archives']

  //properties[targetProperty]の中に配列もしくはundefinedがある
  if (properties) {
    if (properties[targetProperty]) {
      let tagArray = properties[targetProperty] as string[]

      // PARAの場合は、削除リストに一致するものを取り除く
      if (type === "PARA")
        tagArray = tagArray.filter((value) => !deleteArray.includes(value))

      // 重複を削除
      tagArray = [...new Set([...tagArray, addPropPageName])]

      // properties[targetProperty]に反映する
      properties = {
        [targetProperty]: tagArray as string[]
      }
    } else
      properties[targetProperty] = [addPropPageName] as string[] // properties[targetProperty]が存在しない場合はpropertiesに追加する

  } else
    // propertiesが空の場合は、新規作成する
    properties = {
      [targetProperty]: [addPropPageName] as string[]
    }

  //ユーザーによる操作を停止する
  logseq.showMainUI()


  logseq.Editor.removeBlockProperty(firstBlockUuid, targetProperty) // プロパティを削除
  // ページのプロパティを更新
  logseq.Editor.editBlock(firstBlockUuid)
  setTimeout(() => {
    logseq.Editor.insertAtEditingCursor(`\n${targetProperty}:: ${[properties[targetProperty]]},\n`) // アナログで追加
  }, 100)

  // ユーザーによる操作を再開する
  logseq.hideMainUI()

  return firstBlockUuid
}

