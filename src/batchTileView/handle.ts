import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'
import { keyPageBarId, keyReloadButton, keySettingsButton, keyToggleButton, keyToolbar, mainPageTitle, mainPageTitleLower, toolbarIcon } from '../.'
import { generateEmbed } from './embed/generateBlock'
import { handleScrolling } from './scroll'

let now = false
// ページを開いたとき
let isProcessingRootChanged = false

export const handleRouteChange = async (path: string, template: string) => {
  if (template !== "/page/:name" //ページ以外は除外
    || isProcessingRootChanged) return
  isProcessingRootChanged = true
  setTimeout(() => isProcessingRootChanged = false, 100)

  const pageName = path.replace(/^\/page\//, "")
  // pageName が mainPageTitle/Projects などの場合
  const pageNameArray = pageName.split("%2F")
  const type = pageNameArray[1]
  // console.log("pageNameArray[0]", pageNameArray[0])
  // mainPageTitle
  if (pageNameArray[0] === mainPageTitle && type !== undefined) {
    now = true
    // console.log("pageNameArray", pageNameArray)
    await updateMainContent(type, pageNameArray.join("/"))
    // スクロールを縦ではなく横にする (ホイールイベント)
    handleScrolling() // Note: 一部スタイルのみで動作させるが、イベントリスナー内で判定している
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

export const AddToolbarAndMenuButton = () => {
  // ツールバーにボタンを追加
  logseq.App.registerUIItem('toolbar', {
    key: keyToolbar,
    template: `
    <div>
      <a class="button icon" data-on-click="${keyToolbar}" style="font-size: 18px" title="${mainPageTitle} ${t("plugin")}">${toolbarIcon}</a>
    </div>
    `,
  })
  // ページバーにボタンを追加
  logseq.App.registerUIItem('pagebar', {
    key: keyPageBarId,
    template: `
      <div id="${keyPageBarId}" title="${mainPageTitle} ${t("plugin")}">
      <button id="${keyToggleButton}" data-on-click="${keyToggleButton}" title="${t("Change Style")}">🎨</button>
      <button id="${keySettingsButton}" data-on-click="${keySettingsButton}" title="${t("Plugin Settings")}">⚙</button>
      <button id="${keyReloadButton}" data-on-click="${keyReloadButton}" title="${t("Update page list.")}">◆ ${t("Reload")}</button>
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
