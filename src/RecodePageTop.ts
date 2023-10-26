import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { format } from 'date-fns'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
  

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
      } [[${format(new Date(), userDateFormat) //日付リンク
      }]]${pushPageLink // もとのページ名リンク
      }`, {
      sibling: false // ブロックのサブ行に追記
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
