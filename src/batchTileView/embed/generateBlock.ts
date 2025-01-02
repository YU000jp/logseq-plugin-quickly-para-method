import { BlockEntity, IBatchBlock, PageEntity } from "@logseq/libs/dist/LSPlugin"
import { t } from "logseq-l10n"
import { advancedQuery, queryCodeContainsTag } from "./advancedQuery"
import { keyCommonBatchBoardIncludeWord } from "../../settings"


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

      let sibling = false
      const batch: IBatchBlock[] = []
      switch (type) {
        case "Projects":
          sibling = eachCategoryCreateBatchEmbed(array, logseq.settings![keyCommonBatchBoardIncludeWord + type] as string, batch)
          break
        case "Areas of Responsibility":
          sibling = eachCategoryCreateBatchEmbed(array, logseq.settings![keyCommonBatchBoardIncludeWord + "Areas"] as string, batch)
          break
        case "Resources":
          sibling = eachCategoryCreateBatchEmbed(array, logseq.settings![keyCommonBatchBoardIncludeWord + type] as string, batch)
          break
        case "Archives":
          sibling = eachCategoryCreateBatchEmbed(array, logseq.settings![keyCommonBatchBoardIncludeWord + type] as string, batch)
          break
      }
      if (batch.length > 0)
        await refreshPageBlocks(blocks, pageName, batch, type,sibling)
    }
  } else
    // 見つからなかった場合
    await removeBlocksAndNotify(blocks, pageName)


  // ブロックの編集モードを終了
  await logseq.Editor.exitEditingMode()

  logseq.hideMainUI({ restoreEditingCursor: false })
}



//カテゴリ分けごとにEmbedを生成 (カテゴリに含まれない場合は、その他に分類)
const eachCategoryCreateBatchEmbed = (array: string[], config: string, batch: IBatchBlock[]): boolean => {

  if (config === "") {
    for (const v of array)
      batch.push({ content: `{{embed [[${v}]]}}` })
    return false
  } else {
    const categories = config.split("\n")

    for (const category of categories) {
      const categoryArray = array.filter((v) => v.includes(category))
      if (categoryArray.length > 0) {
        batch.push({
          content: `## ${category}`, // embedを使用
          children: categoryArray.map((v) => ({ content: `{{embed [[${v}]]}}` }))
        })
        // 該当するページを配列から削除
        array = array.filter(item => !categoryArray.includes(item))
      }
    }
    // その他のカテゴリーに分類されなかったページを追加
    if (array.length > 0)
      batch.push({
        content: `## ${t("Others")}`, // 分類なし
        children: array.map((v) => ({ content: `{{embed [[${v}]]}}` }))
      })
    return true
  }
}


const refreshPageBlocks = async (
  blocks: { uuid: BlockEntity["uuid"] }[],
  pageName: string,
  batch: IBatchBlock[],
  type: string,
  sibling: boolean,
) => {

  // 全てのブロックを削除
  for (const block of blocks)
    await logseq.Editor.removeBlock(block.uuid)

  // 300ms待機
  await new Promise((resolve) => setTimeout(resolve, 300))

  // メインページの最初のブロックを作成
  const newBlockEntity = await logseq.Editor.appendBlockInPage(pageName, "") as { uuid: BlockEntity["uuid"] } | null
  if (newBlockEntity) {
    await logseq.Editor.insertBatchBlock(newBlockEntity.uuid, batch, { before: false, sibling })

    // 先頭行
    await logseq.Editor.updateBlock(newBlockEntity.uuid, `# [[${type}]]`)
    // await logseq.Editor.removeBlock(newBlockEntity.uuid)
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
  await logseq.Editor.appendBlockInPage(pageName, t("No page found")) as { uuid: BlockEntity["uuid"] } | null
}