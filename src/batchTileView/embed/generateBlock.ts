import { BlockEntity, IBatchBlock, PageEntity } from "@logseq/libs/dist/LSPlugin"
import { t } from "logseq-l10n"
import { keyCommonBatchBoardIncludeWord } from "../../settings"
import { hideMainContent } from "../lib"
import { advancedQuery, queryCodeContainsDoubleTags, queryCodeContainsTag } from "./advancedQuery"



let processingGenerateEmbed = false
export const generateEmbed = async (
  type: string,
  pageName: string,
  blocks: { uuid: BlockEntity["uuid"] }[]
) => {

  if (processingGenerateEmbed) return
  processingGenerateEmbed = true
  setTimeout(() => processingGenerateEmbed = false, 900)

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

      const boardBatch: IBatchBlock[] = []
      const typeMapping = {
        "Projects": "Projects",
        "Areas of Responsibility": "Areas",
        "Resources": "Resources",
        "Archives": "Archives"
      }
      const settingKey = typeMapping[type as keyof typeof typeMapping]
      if (settingKey)
        await eachCategoryCreateBatchEmbed(
          array,
          logseq.settings![keyCommonBatchBoardIncludeWord + settingKey] as string,
          boardBatch,
          type,
        )

      if (boardBatch.length > 0)
        await refreshPageBlocks(blocks, pageName, boardBatch, type)
    }
  } else
    // 見つからなかった場合
    await removeBlocksAndNotify(blocks, pageName, type)


  // ブロックの編集モードを終了
  await logseq.Editor.exitEditingMode()

  logseq.hideMainUI({ restoreEditingCursor: false })
  processingGenerateEmbed = false
}



//カテゴリ分けごとにEmbedを生成 (カテゴリに含まれない場合は、その他に分類)
const eachCategoryCreateBatchEmbed = async (
  array: string[],
  config: string,
  boardBatch: IBatchBlock[],
  type: string,
) => {

  // カテゴリごとに分類 (ページタイトルでマッチング)
  if (logseq.settings!.batchBoardCategoryMatching as string === "Page-title") {

    if (config === "")
      boardBatch.push({
        content: `# ${t("All")}`,
        children: array.map((v) => ({ content: `{{embed [[${v}]]}}` }))
      })
    else {
      const categories = config.split("\n")

      for (const category of categories) {
        const categoryArray = array.filter((v) => v.includes(category))
        if (categoryArray.length > 0) {
          boardBatch.push({
            content: `## ${category}`, // embedを使用
            children: categoryArray.map((v) => ({ content: `{{embed [[${v}]]}}` }))
          })
          // 該当するページを配列から削除
          array = array.filter(item => !categoryArray.includes(item))
        }
      }
      // その他のカテゴリーに分類されなかったページを追加
      if (array.length > 0)
        boardBatch.push({
          content: `## ${t("Others")}`, // 分類なし
          children: array.map((v) => ({ content: `{{embed [[${v}]]}}` }))
        })
    }


  } else // カテゴリごとに分類 (ページタグでマッチング)
    if (logseq.settings!.batchBoardCategoryMatching as string === "Page-tag") {
      if (config === "")
        boardBatch.push({
          content: `# ${t("All")}`,
          children: array.map((v) => ({ content: `{{embed [[${v}]]}}` }))
        })
      else {
        // カテゴリーにページタグが一致するページがあるかないかのフラグ
        let flagMatchPages = false

        for (const category of config.split("\n")) {
          const pageEntities = await advancedQuery(queryCodeContainsDoubleTags, `"${type}"`, `"${category}"`) as { name: PageEntity["name"] }[] | null
          if (pageEntities && pageEntities.length > 0) {
            const categoryArray = pageEntities.map((v) => v.name).sort()
            boardBatch.push({
              content: `## ${category}`, // embedを使用
              children: categoryArray.map((v) => ({ content: `{{embed [[${v}]]}}` }))
            })
            // 該当するページを配列から削除
            array = array.filter(item => !categoryArray.includes(item))
            if (flagMatchPages === false)
              flagMatchPages = true
          }
        }
        // その他のカテゴリーに分類されなかったページを追加
        if (array.length > 0)
          boardBatch.push({
            content: `## ${flagMatchPages === false ? t("All") : t("Others")}`, // 分類なし
            children: array.map((v) => ({ content: `{{embed [[${v}]]}}` }))
          })
      }
    }
}


const refreshPageBlocks = async (
  blocks: { uuid: BlockEntity["uuid"] }[],
  pageName: string,
  batch: IBatchBlock[],
  type: string,
) => {

  // 一時的にDOMエレメントを非表示にする
  hideMainContent('#main-content-container div[id^="quickly-para-method-plugin/"] ')

  // 全てのブロックを削除
  await clearBlocks(blocks)

  // 600ms待機
  await new Promise((resolve) => setTimeout(resolve, 600))

  // メインページの最初のブロックを作成
  const newBlock = await logseq.Editor.appendBlockInPage(pageName, "") as { uuid: BlockEntity["uuid"] } | null
  //下にくるブロックが先
  if (newBlock)
    await generateContentForMainPageContent(newBlock, type, batch)
}


// 全てのブロックを削除
const removeBlocksAndNotify = async (
  blocks: { uuid: BlockEntity["uuid"] }[],
  pageName: string,
  type: string,
) => {
  await refreshPageBlocks(blocks, pageName, [{ content: t("No page found") }], type)
}


const generateContentForMainPageContent = async (
  newBlock: { uuid: BlockEntity["uuid"] },
  type: string,
  boardBatch: IBatchBlock[]
) => {

  const batch: IBatchBlock[] = []
  // batchの先頭に追加
  batch.unshift({
    content: `# ${t("Board")}`,
    children: boardBatch,
  })

  // batchの最後尾に追加
  if (logseq.settings!.showPageContent as boolean === true) {
    batch.push({
      content: `# ${t("Page content")}`,
      children: [{ content: `{{embed [[${type}]]}}` }]
    })
  }
  if (logseq.settings!.showLinkedReferences as boolean === true) {
    batch.push({
      content: `# ${t("Linked References")}`,
      children: [{ content: `{{query (and [[${type}]] (not (page [[${type}]])) (not (page [[Quickly-PARA-Method-Plugin/${type}]])))}}` }]
    })
  }

  // バッチを挿入
  await logseq.Editor.insertBatchBlock(newBlock.uuid, batch, { before: true, sibling: true })
  // ブロックを削除
  await logseq.Editor.removeBlock(newBlock.uuid)
}


const clearBlocks = async (blocks: { uuid: BlockEntity["uuid"] }[]) => {
  for (const block of blocks)
    await logseq.Editor.removeBlock(block.uuid)
}
