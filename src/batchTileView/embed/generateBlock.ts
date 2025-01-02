import { BlockEntity, IBatchBlock, PageEntity } from "@logseq/libs/dist/LSPlugin"
import { t } from "logseq-l10n"
import { advancedQuery, queryCodeContainsTag } from "./advancedQuery"


export const generateEmbed = async (
  type: string,
  pageName: string,
  blocks: { uuid: BlockEntity["uuid"] }[]
) => {

  await logseq.Editor.exitEditingMode()

  logseq.showMainUI({ autoFocus: false })
  setTimeout(() => logseq.hideMainUI({ restoreEditingCursor: false }), 3000)


  const pageEntities = await advancedQuery(queryCodeContainsTag, `"${type}"`) as { name: PageEntity["name"] }[] | null

  if (pageEntities && pageEntities.length > 0) {

    // 連想配列を配列に変換
    const array = pageEntities.map((v) => v.name).sort()
    // console.log(array)


    // 保存されている設定を取得
    const config = logseq.settings![type] as string[]

    if (logseq.settings![type] === undefined // 保存されていない場合に生成
      || (config.length !== array.length || !config.every((v, i) => v === array[i])) // config と array が一致しない場合に生成 (前回分と一致しない場合に生成)
    ) {
      logseq.updateSettings({ [type]: array })// 今回分を保存

      const batch: IBatchBlock[] = []
      for (const pageName of array)
        if (pageName)
          batch.push({
            content: `{{embed [[${pageName}]]}}`, // embedを使用
          }) // 処理過負荷防止のためembedのみ使用
      // console.log(batch)
      if (batch.length > 0)
        await refreshPageBlocks(blocks, pageName, batch, type)
    }
  } else
    // 見つからなかった場合
    await removeBlocksAndNotify(blocks, pageName)


  // ブロックの編集モードを終了
  await logseq.Editor.exitEditingMode()

  logseq.hideMainUI({ restoreEditingCursor: false })
}



const refreshPageBlocks = async (
  blocks: { uuid: BlockEntity["uuid"] }[],
  pageName: string,
  batch: IBatchBlock[],
  type: string
) => {

  // 全てのブロックを削除
  for (const block of blocks)
    await logseq.Editor.removeBlock(block.uuid)

  // 300ms待機
  await new Promise((resolve) => setTimeout(resolve, 300))

  // メインページの最初のブロックを作成
  const newBlockEntity = await logseq.Editor.appendBlockInPage(pageName, "") as { uuid: BlockEntity["uuid"] } | null
  if (newBlockEntity) {
    await logseq.Editor.insertBatchBlock(newBlockEntity.uuid, batch, { before: false, sibling: false })

    // 先頭行
    await logseq.Editor.updateBlock(newBlockEntity.uuid, `# [[${type}]]`)
  }
}


// 全てのブロックを削除
const removeBlocksAndNotify = async (
  blocks: { uuid: BlockEntity["uuid"] }[],
  pageName: string
) => {
  for (const block of blocks)
    await logseq.Editor.removeBlock(block.uuid)
  //300ms待機
  await new Promise((resolve) => setTimeout(resolve, 300))
  // メインページの最初のブロックを作成
  await logseq.Editor.appendBlockInPage(pageName, t("No pages found")) as { uuid: BlockEntity["uuid"] } | null
}

