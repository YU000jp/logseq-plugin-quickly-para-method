import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n


// UuidからPageEntityを取得 (右サイドバー or メインコンテンツ)
export const getPageEntityFromBlockUuid = async (uuid: string) => {
  const block = await logseq.Editor.getBlock(uuid) as BlockEntity | null
  if (!block) return null
  return await logseq.Editor.getPage(block.page.id) as PageEntity | null
}

// ポップアップ削除 キー固定
export const removePopup = () => {
  const element = parent.document.getElementById("quickly-para-method--openQuickly") as HTMLDivElement | null
  if (element) element.remove()
}


// ページタイトルリンクをコピー
export const copyPageTitleLink = async () => {
  const page = await logseq.Editor.getCurrentPage() as PageEntity | null
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
    if (para === true) logseq.Editor.createPage(name, { icon, tags: [t("[[The PARA Method]]")] }, { createFirstBlock: true, }) //PARAページの作成、タグをつける
    else logseq.Editor.createPage(name, { icon, }, { createFirstBlock: true, })
    logseq.UI.showMsg(t("Created page") + "\n\n" + name, "success", { timeout: 1900 })
  }
}


/**
 * ブロックにあるプロパティを強制的に反映させる
 * @param blockUuid 対象ブロック(一行目)のUUID
 * @param flagLock ユーザーによる操作を停止するかどうか
 */
export const reflectProperty = async (blockUuid: string, flagLock?: boolean) => {

  //ユーザーによる操作を停止する
  if (flagLock) logseq.showMainUI()
  // ブロックの編集を終了する
  logseq.Editor.restoreEditingCursor()
  setTimeout(async () => {
    // ブロックを編集する
    logseq.Editor.editBlock(blockUuid)
    setTimeout(() => {
      //改行を挿入
      logseq.Editor.insertAtEditingCursor(",\n")
      // ユーザーによる操作を再開する
      if (flagLock) logseq.hideMainUI()
    },
      100)
  }, 500)

}


/**
 * ページ名やプロパティ名を変更する関数 メッセージ付き
 * @param oldName - 変更前のプロパティ名
 * @param newName - 変更後のプロパティ名
 * @returns Promise<void>
 */
export const renamePageAndProperty = async (oldName: string, newName: string) => {
  const oldPage = await logseq.Editor.getPage(oldName) as PageEntity | null
  if (!oldPage) return
  logseq.Editor.renamePage(oldName, newName)
  logseq.UI.showMsg(`${t("Renamed page")}`, "success")
}


/**
 * 先頭行が空のブロックを全て削除する。
 * @param blocksTree - 削除対象のブロックツリー
 */
export const removeEmptyBlockFirstLineAll = async (blocksTree: BlockEntity[]) => {
  const firstBlock = blocksTree[0] as BlockEntity
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

