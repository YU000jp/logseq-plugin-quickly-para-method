import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { format } from 'date-fns'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n


/**
 * 指定されたページの最初の行に、日付リンクともとのページ名リンクを追加する
 * @param userDateFormat ユーザーが設定した日付形式
 * @param targetPageName 日付リンク
 * @param pushPageLink 元のページ名リンク
 */

export const RecodeDateToPageTop = async (userDateFormat: string, targetPageName: string, pushPageLink: string, flagRepeat?: boolean): Promise<boolean> => {
  const blocks = await logseq.Editor.getPageBlocksTree(targetPageName) as BlockEntity[]
  if (blocks.length > 0) {

    const flagArchives: boolean = logseq.settings!.archivesDone === true && targetPageName === "Archives"

    //先頭行の子孫にある空ブロックを削除
    await removeEmptyBlockFirstLineAll(blocks)

    const insertContent = `${flagArchives === true ? "DONE" : "" // Archivesページの場合はDONEを追加
      } [[${format(new Date(), userDateFormat) //日付リンク
      }]] ${logseq.settings!.sortByMonthSeparator} ${pushPageLink // もとのページ名リンク
      }`

    if (logseq.settings!.sortByMonth === true) {

      //月ごとのソートをする場合
      const success: boolean = await sortByMonth(blocks, insertContent)
      if (success === false) return false

    } else {

      // 先頭行の下に追記する
      await logseq.Editor.insertBlock(blocks[0].uuid, insertContent, { sibling: false }) // ブロックのサブ行に追記

    }

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

const removeEmptyBlockFirstLineAll = async (blocks: BlockEntity[]) => {
  const firstBlock = blocks[0] as BlockEntity
  const children = firstBlock.children as BlockEntity[]
  if (children && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child.content === "")
        await logseq.Editor.removeBlock(child.uuid)
      // 子孫ブロックがある場合は探索する
      if (child.children && child.children.length > 0)
        await removeEmptyBlockFirstLineAll(child.children as BlockEntity[])
    }
  }
}

//月ごとにソートする場合
const sortByMonth = async (blocks: BlockEntity[], insertContent: string): Promise<boolean> => {

  //同じ月のサブ行がある場合はそのブロックのサブ行に追記する
  const monthFormat = format(new Date(), "yyyy/MM")
  const firstBlock = blocks[0] as BlockEntity
  const children = firstBlock.children as BlockEntity[]
  //childrenのcontentが日付フォーマットと一致するか確認(先頭が 「### 」から始まる)
  const monthString = logseq.settings!.sortByMonthLink ? `### [[${monthFormat}]]` : `### ${monthFormat}`
  if (children && children.length > 0) {

    const child = children.find(child => child.content.startsWith(monthString))
    if (child) {
      //マッチした場合

      //insertContentがすでにサブ行に記録されていないか調べる
      const subChildren = child.children as BlockEntity[]
      if (subChildren
        && subChildren.length > 0
        && subChildren.find(subChild => subChild.content === insertContent)) {
        logseq.UI.showMsg(t("Failed (Already recorded)"), "warning") // すでに記録されている場合は終了
        return false
      }


      //そのブロックのサブ行に追記する
      await logseq.Editor.insertBlock(child.uuid, insertContent, { sibling: false })
      return true
      // ここで成功として終了
    }
  }

  //マッチしない場合

  //先頭行の下に、新しいブロックを作成して月分類のブロックを作成し、その中にサブ行を追記する
  const newBlock = await logseq.Editor.insertBlock(firstBlock.uuid, monthString, { sibling: false }) as BlockEntity | null // ブロックのサブ行に追記
  if (!newBlock) {
    //年のためエラー処理
    logseq.UI.showMsg(t("Failed (Cannot create a new block in first block of the page)"), "error")
    return false
  }
  // ブロックのサブ行に追記
  await logseq.Editor.insertBlock(newBlock.uuid, insertContent, { sibling: false })
  return true
}

