import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { format } from 'date-fns'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { removeEmptyBlockFirstLineAll } from './lib'
import { sortByMonth } from './lib'


/**
 * 指定されたページの最初の行に、日付リンクともとのページ名リンクを追加する
 * @param userDateFormat ユーザーが設定した日付形式
 * @param targetPageName 日付リンク
 * @param pushPageLink 元のページ名リンク
 */

export const RecodeDateToPageTop = async (userDateFormat: string, targetPageName: string, pushPageLink: string, flagRepeat?: boolean): Promise<boolean> => {
  const blocks = await logseq.Editor.getPageBlocksTree(targetPageName) as BlockEntity[]
  if (blocks.length > 0) {

    const flagArchives: boolean = logseq.settings!.archivesDone === true
      && targetPageName === "Archives"

    //先頭行の子孫にある空ブロックを削除
    await removeEmptyBlockFirstLineAll(blocks[0])

    const insertContent = `${flagArchives === true ? "DONE" : "" // Archivesページの場合はDONEを追加
      } [[${format(new Date(), userDateFormat) //日付リンク
      }]] ${logseq.settings!.sortByMonthSeparator} ${pushPageLink // もとのページ名リンク
      }`

    if (logseq.settings!.sortByMonth === true) {

      //月ごとのソートをする場合
      const success: boolean = await sortByMonth(blocks, insertContent)
      if (success === false) return false

    } else
      // 先頭行の下に追記する
      await logseq.Editor.insertBlock(blocks[0].uuid, insertContent, { sibling: false }) // ブロックのサブ行に追記


    if (flagArchives === true) logseq.UI.showMsg(t("[DONE] marked and added date to the top of the page"), "success", { timeout: 3000 })
    else logseq.UI.showMsg(t("Added date to the top of the page"), "success", { timeout: 3000 })

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
  }
  return false
}
