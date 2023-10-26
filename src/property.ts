import { AppUserConfigs, BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { format } from 'date-fns'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { removePopup } from './lib'
import { reflectProperty } from './lib'


/**
 * コマンドを実行する (チェックをおこなう)
 * @param addProperty 追加するプロパティ
 * @param addType 追加するプロパティのタイプ
 */
export const runCommand = async (addProperty: string, addType: string) => {

  // 追加するプロパティが空の場合はキャンセルとする
  if (addProperty === "") return logseq.UI.showMsg(t("Cancel"), "warning")

  // 現在のページを取得する
  const getCurrent = await logseq.Editor.getCurrentPage() as PageEntity | null
  if (getCurrent) {
    // 現在のページと同じ名前のプロパティを追加しようとした場合はキャンセルとする
    if (getCurrent.name === addProperty
      || getCurrent.originalName === addProperty)
      return logseq.UI.showMsg(t("No need to tag the current page."), "warning")

    // 現在のページのブロックツリーを取得する
    const getCurrentTree = await logseq.Editor.getCurrentPageBlocksTree() as BlockEntity[] | null
    if (getCurrentTree === null) return logseq.UI.showMsg(t("Failed (Can not get the current page)"), "warning")

    // ポップアップを削除
    removePopup()

    // ページにプロパティを追加する
    await updatePageProperty(addProperty, getCurrent, addType, getCurrentTree[0].uuid)

  }
}


/**
 * ページにプロパティを追加し、必要に応じて日付を記録する
 * @param addProperty 追加するプロパティ
 * @param getCurrent 現在のページ
 * @param addType 追加するプロパティのタイプ
 * @param uuid ページの最初のブロックのUUID
 */
export const updatePageProperty = async (addProperty: string, getCurrent: PageEntity, addType: string, uuid: string) => {

  const message = () => {
    if (addType === "INBOX") logseq.UI.showMsg(t("Into [Inbox]"), "success", { timeout: 3000 })
    else logseq.UI.showMsg(`${t("Page-Tag")} ${addProperty}`, "info", { timeout: 3000 })
  }

  // ページにプロパティを追加する
  if (addType !== "INBOX"
    && logseq.settings!.booleanRecodeOnly === false //タグをつけない設定がオフの場合
  ) await updatePageProperties(addProperty, "tags", getCurrent.properties, addType, uuid)

  // ページに日付を記録する
  if ((addType !== "PARA" // PARAページ以外
    && logseq.settings?.switchRecodeDate === true) // 設定が有効
    // もしくは
    || (addType === "PARA" // PARAページ
      && logseq.settings?.switchPARArecodeDate === true)) { // 設定が有効

    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs

    setTimeout(async () => {
      const success: boolean = await RecodeDateToPageTop(preferredDateFormat, addProperty, " [[" + getCurrent.originalName + "]]")
      if (success) message()
    }, 300)

  } else {
    // 成功した場合のメッセージを表示
    message()
  }

}

/**
 * 指定されたページの最初の行に、日付リンクともとのページ名リンクを追加する
 * @param userDateFormat ユーザーが設定した日付形式
 * @param targetPageName 日付リンク
 * @param pushPageLink 元のページ名リンク
 */
export const RecodeDateToPageTop = async (userDateFormat, targetPageName, pushPageLink, flagRepeat?: boolean): Promise<boolean> => {
  const blocks = await logseq.Editor.getPageBlocksTree(targetPageName) as BlockEntity[]
  if (blocks.length > 0) {

    const flagArchives: boolean = logseq.settings!.archivesDone === true && targetPageName === "Archives"
    logseq.showMainUI() // 作業保護

    // 先頭行の下に追記する
    await logseq.Editor.insertBlock(blocks[0].uuid,
      `${flagArchives === true ? "DONE" : "" // Archivesページの場合はDONEを追加
      } [[${format(new Date(), userDateFormat)//日付リンク
      }]]${pushPageLink// もとのページ名リンク
      }`, {
      sibling: false// ブロックのサブ行に追記
    })
    if (flagArchives === true) logseq.UI.showMsg(t("[DONE] marked and added date to the top of the page"), "success", { timeout: 3000 })
    else logseq.UI.showMsg(t("Added date to the top of the page"), "success", { timeout: 3000 })

    logseq.hideMainUI() // 作業保護解除
    return true
  } else {
    if (flagRepeat) {
      logseq.UI.showMsg("Failed (Can not get the current page)", "warning") // 無限ループを防ぐ
      return false
    }

    // ページが存在しない場合は作成
    if (await logseq.Editor.createPage(targetPageName, "", { createFirstBlock: true, redirect: true }))
      // 作成したら再度実行
      setTimeout(() => RecodeDateToPageTop(userDateFormat, targetPageName, pushPageLink, true), 100)
    // return trueはループで返却される
  }
  return false
}


/**
 * ページのプロパティを更新する
 * @param addProperty 追加するプロパティ
 * @param targetProperty 更新するプロパティの種類
 * @param properties ページのプロパティ
 * @param addType 追加するプロパティのタイプ
 * @param firstBlockUuid ページの最初のブロックのUUID
 */
const updatePageProperties = (addProperty: string, targetProperty: string, properties, addType: string, firstBlockUuid: string) => {

  // 削除するプロパティのリスト
  let deleteArray = ['Projects', 'Resources', 'Areas of responsibility', 'Archives']

  //properties[targetProperty]の中に配列もしくはundefinedがある
  if (properties) {
    if (properties[targetProperty]) {

      let tagArray = properties[targetProperty] as string[]

      // PARAの場合は、削除リストに一致するものを取り除く
      if (addType === "PARA") {
        tagArray = tagArray.filter((value) => !deleteArray.includes(value))
      }

      // 重複を削除
      tagArray = [...new Set([...tagArray, addProperty])]

      // properties[targetProperty]に反映する
      properties = {
        [targetProperty]: tagArray as string[]
      }

    } else {

      // properties[targetProperty]が存在しない場合はpropertiesに追加する
      properties[targetProperty] = [addProperty] as string[]

    }

  } else {

    // propertiesが空の場合は、新規作成する
    properties = {
      [targetProperty]: [addProperty] as string[]
    }


  }

  //ユーザーによる操作を停止する
  logseq.showMainUI()

  setTimeout(() => {

    // ページのプロパティを更新
    logseq.Editor.upsertBlockProperty(firstBlockUuid, targetProperty, properties[targetProperty])

    // ページタグを反映する
    reflectProperty(firstBlockUuid)

  }, 100)

  // ユーザーによる操作を再開する
  logseq.hideMainUI()

  return firstBlockUuid
}

