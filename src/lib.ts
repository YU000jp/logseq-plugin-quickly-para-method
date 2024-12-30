import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n


// UuidからPageEntityを取得 (右サイドバー or メインコンテンツ)
export const getPageEntityFromBlockUuid = async (uuid: string) => {
  const block = await logseq.Editor.getBlock(uuid) as { page: BlockEntity["page"] } | null
  if (!block) return null
  return await logseq.Editor.getPage(block.page.id) as { journal?: PageEntity["journal?"], originalName: PageEntity["originalName"], properties: PageEntity["properties"] } | null
}

// ポップアップ削除 キー固定
export const removePopup = () => {
  const element = parent.document.getElementById("quickly-para-method--openQuickly") as HTMLDivElement | null
  if (element) element.remove()
}


// ページ名リンクをコピー
export const copyPageTitleLink = async () => {
  const page = await logseq.Editor.getCurrentPage() as { originalName: PageEntity["originalName"] } | null
  if (page) {
    const text: string = `[[${page.originalName}]]`
    // focus the window
    window.focus()
    navigator.clipboard.writeText(text)
    logseq.UI.showMsg(t("Copy current full page name to clipboard"), "success")
  }
}

// ページ名からページを開く (Shiftキーで右サイドバーに開く)
export const openPageFromPageName = async (pageName: string, shiftKey: boolean) => {
  if (shiftKey === true) {
    const page = await logseq.Editor.getPage(pageName) as PageEntity | null
    if (page) {
      logseq.Editor.openInRightSidebar(page.uuid) //ページが存在しない場合は開かない
      logseq.UI.showMsg(t("Opened page in right sidebar") + "\n\n" + pageName, "success", { timeout: 1900 })
    }
    else return logseq.UI.showMsg(t("Page not found"), "error")
  } else {
    logseq.UI.showMsg(t("Opened page in main content") + "\n\n" + pageName, "success", { timeout: 1900 })
    logseq.App.replaceState('page', { name: pageName })
  }
  removePopup()
}


export const createPageForPARA = async (name: string, icon: string, para: boolean) => {
  const getPage = await logseq.Editor.getPage(name) as PageEntity | null
  if (getPage === null) {
    if (para === true) logseq.Editor.createPage(name, { icon }, { createFirstBlock: true, }) //PARAページの作成、タグをつける
    else logseq.Editor.createPage(name, { icon, }, { createFirstBlock: true, })
    logseq.UI.showMsg(t("Created page") + "\n\n" + name, "success", { timeout: 1900 })
  }
}


/**
 * ページ名やプロパティ名を変更する関数 メッセージ付き
 * @param oldName - 変更前のプロパティ名
 * @param newName - 変更後のプロパティ名
 * @returns Promise<void>
 */
export const renamePageAndProperty = async (oldName: string, newName: string) => {
  const oldPage = await logseq.Editor.getPage(oldName) as { uuid: PageEntity["uuid"] } | null
  if (!oldPage) return
  logseq.Editor.renamePage(oldName, newName)
  logseq.UI.showMsg(`${t("Renamed page")}`, "success")
}


/**
 * 先頭行が空のブロックを全て削除する。
 * @param block0 - 削除対象のブロックツリーの先頭ブロック
 */
export const removeEmptyBlockFirstLineAll = async (firstBlock: BlockEntity) => {
  const children = firstBlock.children as BlockEntity[]
  if (children
    && children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child.content === "")
        await logseq.Editor.removeBlock(child.uuid)
      // 子孫ブロックがある場合は探索する
      if (child.children
        && child.children.length > 0)
        await removeEmptyBlockFirstLineAll((child.children as BlockEntity[])[0])
    }
  }
}

