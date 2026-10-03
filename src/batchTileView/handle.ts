import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'
import { keyPageBarId, keyReloadButton, keySettingsButton, keyToggleButton, mainPageTitle, mainPageTitleLower } from '../.'
import { booleanDbGraph } from '../logseqDbGraphCheck'
import { generateEmbed } from './embed/generateBlock'

let now = false
// ページを開いたとき
let isProcessingRootChanged = false

export const handleRouteChange = async (path: string, template: string) => {

  if (booleanDbGraph() // DBグラフでは動作しない
    || template !== "/page/:name" //ページ以外は除外
    || isProcessingRootChanged) return
  isProcessingRootChanged = true
  setTimeout(() => isProcessingRootChanged = false, 100)

  const pageName = path.replace(/^\/page\//, "")

  // pageName が mainPageTitle/Projects などの場合
  const pageNameArray = pageName.split("%2F")

  const type = pageNameArray[1]
  // console.log("pageNameArray[0]", pageNameArray[0])


  if (pageNameArray[0] === mainPageTitle && type !== undefined) {
    // mainPageTitleの場合
    now = true
    // console.log("pageNameArray", pageNameArray)
    await updateMainContent(type, pageNameArray.join("/"))

  } else
    if (now === true) {
      now = false
      // 必ずHomeに移動してしまうバグがあるためdeletePage()は使えないので、ブロックのみを削除
      const blockEntities = await logseq.Editor.getPageBlocksTree(mainPageTitle) as { uuid: BlockEntity["uuid"], children: BlockEntity["children"] }[] | null
      if (blockEntities) {
        await logseq.Editor.updateBlock(blockEntities[0].uuid, "", {})
        if (blockEntities[0]) {
          const children = blockEntities[0].children as { uuid: BlockEntity["uuid"] }[] | undefined
          if (children)
            for (const child of children)
              await logseq.Editor.removeBlock(child.uuid)

        }
      }
    }
}

export const updateMainContent = async (type: string, pageName: string) => {
  const blocks = await logseq.Editor.getCurrentPageBlocksTree() as { uuid: BlockEntity["uuid"] }[]
  if (blocks)
    await generateEmbed(type, pageName, blocks)
}

export const AddMenuButton = () => {
  // ページバーにボタンを追加
  logseq.App.registerUIItem('pagebar', {
    key: keyPageBarId,
    template: `
      <div id="${keyPageBarId}" title="${mainPageTitle} ${t("Plugin")}">
      <button id="${keyToggleButton}" data-on-click="${keyToggleButton}" title="${t("Change style")}">🎨</button>
      <button id="${keySettingsButton}" data-on-click="${keySettingsButton}" title="${t("Plugin settings")}">⚙</button>
      <button id="${keyReloadButton}" data-on-click="${keyReloadButton}" title="${t("Update the list")}">◆ ${t("Reload")}</button>
      </div>
      <style>
      #${keyPageBarId} {
        display: none;
      }
      div.page:has([id^="${t(mainPageTitleLower)}/"i]) #${keyPageBarId} {
        display: block;
      }
      </style>
      `,
  })
}
