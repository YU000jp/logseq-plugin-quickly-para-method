import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n


// UuidからPageEntityを取得 (右サイドバー or メインコンテンツ)
export const getPageEntityFromBlockUuid = async (uuid: string) => {
  const block = await logseq.Editor.getBlock(uuid) as BlockEntity | null
  if (!block) return
  const pageTitleRightSidebar = parent.document.querySelector(`div#right-sidebar div.sidebar-item.content:has(div[blockid="${block.uuid}"]) a.page-title`) as HTMLAnchorElement | null
  const rightSidebar: Boolean = (pageTitleRightSidebar && pageTitleRightSidebar!.textContent) ? true : false
  const pageTitleContentPage = parent.document.querySelector(`div#main-content-container div.content:has(div[blockid="${block.uuid}"]) :is(a.title)`) as HTMLAnchorElement | null
  const ContentPage: Boolean = (pageTitleContentPage && pageTitleContentPage!.textContent) ? true : false
  if (ContentPage || rightSidebar) {
    const pageTitle = rightSidebar ? pageTitleRightSidebar!.textContent : pageTitleContentPage!.textContent
    if (pageTitle)  return await logseq.Editor.getPage(pageTitle as string) as PageEntity | null
  }
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
    logseq.UI.showMsg(t("Copy page title link"), "success")
  }
}

// ページ名からページを開く (Shiftキーで右サイドバーに開く)
export const openPageFromPageName = async (pageName: string, shiftKey: boolean) => {
  if (shiftKey === true) {
    const page = await logseq.Editor.getPage(pageName) as PageEntity | null
    if (page) logseq.Editor.openInRightSidebar(page.uuid) //ページが存在しない場合は開かない
    else return logseq.UI.showMsg(t("Page not found"), "error")
  } else {
    logseq.App.replaceState('page', { name: pageName })
  }
  removePopup()
}
export const createPageForPARA = async (name: string, icon: string, para: boolean) => {
  const getPage = await logseq.Editor.getPage(name) as PageEntity | null
  if (getPage === null) {
    if (para === true) logseq.Editor.createPage(name, { icon, tags: t("[[The PARA Method]]") }, { createFirstBlock: true, }) //PARAページの作成、タグをつける
    else logseq.Editor.createPage(name, { icon, }, { createFirstBlock: true, })
  }
}


/**
 * ブロックにあるプロパティを強制的に反映させる
 * @param blockUuid 対象ブロックのUUID
 */
export const reflectProperty = async (blockUuid: string) => {

  //ユーザーによる操作を停止する
  logseq.showMainUI()
  // ブロックの編集を終了する
  logseq.Editor.restoreEditingCursor()
  setTimeout(async () => {
    // ブロックを編集する
    logseq.Editor.editBlock(blockUuid)
    setTimeout(() => {
      //改行を挿入
      logseq.Editor.insertAtEditingCursor("\n")
      // ユーザーによる操作を再開する
      logseq.hideMainUI()
    },
      100)
  }, 500)

}

