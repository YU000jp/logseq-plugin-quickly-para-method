import { PageEntity, BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { key } from '.'


export const getPageEntityFromBlockUuid = async (uuid: string) => {
  const block = await logseq.Editor.getBlock(uuid) as BlockEntity | null
  if (!block) return
  const pageTitleRightSidebar = parent.document.querySelector(`div#right-sidebar div.sidebar-item.content:has(div[blockid="${block.uuid}"]) a.page-title`) as HTMLAnchorElement | null
  const rightSidebar: Boolean = (pageTitleRightSidebar && pageTitleRightSidebar!.textContent) ? true : false
  const pageTitleContentPage = parent.document.querySelector(`div#main-content-container div.content:has(div[blockid="${block.uuid}"]) :is(a.title)`) as HTMLAnchorElement | null
  const ContentPage: Boolean = (pageTitleContentPage && pageTitleContentPage!.textContent) ? true : false
  if (ContentPage || rightSidebar) {
    const pageTitle = rightSidebar ? pageTitleRightSidebar!.textContent : pageTitleContentPage!.textContent
    if (pageTitle) {
      return await logseq.Editor.getPage(pageTitle as string) as PageEntity | null
    }
  }
}

export const removePopup = () => {
  const element = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null
  if (element) element.remove()
}

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