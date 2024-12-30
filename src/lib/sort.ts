import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { format } from 'date-fns'
import { t } from 'logseq-l10n'

//月ごとにソートする場合

export const sortByMonth = async (blocks: BlockEntity[], insertContent: string): Promise<boolean> => {

  //同じ月のサブ行がある場合はそのブロックのサブ行に追記する
  const monthFormat = format(new Date(), "yyyy/MM")
  const firstBlock = blocks[0] as { uuid: BlockEntity["uuid"]; children: BlockEntity["children"]} 
  const children = firstBlock.children as BlockEntity[]
  //childrenのcontentが日付フォーマットと一致するか確認(先頭が 「### 」から始まる)
  const monthString = logseq.settings!.sortByMonthLink ? `### [[${monthFormat}]]` : `### ${monthFormat}`
  if (children
    && children.length > 0) {

    const child = children.find(child => child.content.startsWith(monthString))
    if (child) {
      //マッチした場合
      //insertContentがすでにサブ行に記録されていないか調べる
      const subChildren = child.children as BlockEntity[] | undefined
      if (subChildren
        && subChildren.length > 0
        && subChildren.find(subChild => subChild.content === insertContent)) {
        logseq.UI.showMsg(t("Failed (Already recorded)"), "warning") // すでに記録されている場合は終了
        return false
      } else {
        //そのブロックのサブ行に追記する
        await logseq.Editor.insertBlock(child.uuid, insertContent, { sibling: false })
        return true
        // ここで成功として終了
      }
    }
  }

  //マッチしない場合
  //先頭行の下に、新しいブロックを作成して月分類のブロックを作成し、その中にサブ行を追記する
  const newBlock = await logseq.Editor.insertBlock(firstBlock.uuid, monthString, { sibling: false }) as { uuid: BlockEntity["uuid"]}  | null // ブロックのサブ行に追記
  if (!newBlock) {
    //年のためエラー処理
    logseq.UI.showMsg(t("Failed (Cannot create a new block in first block of the page)"), "error")
    return false
  }
  // ブロックのサブ行に追記
  await logseq.Editor.insertBlock(newBlock.uuid, insertContent, { sibling: false })
  return true
}
