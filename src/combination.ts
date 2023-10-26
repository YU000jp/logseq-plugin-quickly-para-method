import { AppUserConfigs, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { removePopup } from './lib'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { RecodeDateToPageTop } from './property'


// ページを作成するダイアログを表示する
export const combinationNewPage = async (title: string, tags: string) => {
  logseq.provideUI({
    attrs: {
      title,
    },
    key: "openQuickly",
    reset: true,
    template: `
        <p>${t("New Page Title")}: <input id="newPageTitle" type="text" style="width:340px"/>
        <button id="CreatePageButton">${t("Submit")}</button></p>
        `,
    style: {
      width: "640px",
      height: "150px",
      left: "unset",
      bottom: "unset",
      right: "1em",
      top: "4em",
      paddingLeft: "1.8em",
      paddingTop: "1.4em",
      backgroundColor: 'var(--ls-primary-background-color)',
      color: 'var(--ls-primary-text-color)',
      boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
    },
  })
  setTimeout(eventListener(tags), 100)
}


// イベントリスナーを追加する
function eventListener(tags: string): () => void {
  return () => {
    const button = parent.document.getElementById("CreatePageButton") as HTMLButtonElement
    if (button) {
      let processing: Boolean = false
      button.addEventListener("click", async () => {
        if (processing) return
        const inputTitle = (parent.document.getElementById("newPageTitle") as HTMLInputElement).value as string | null
        if (!inputTitle) return
        processing = true

        //ページが存在しないことを確認する
        if ((await logseq.Editor.getPage(inputTitle) as PageEntity | null) === null) {
          const createPage = await logseq.Editor.createPage(inputTitle, tags === "Inbox" ? {} : { tags }, { createFirstBlock: false, redirect: true })
          if (createPage) {
            const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs

            // ページを作成したら、ページに日付を記録する
            setTimeout(async() => {
              const success: boolean = await RecodeDateToPageTop(preferredDateFormat, tags, " [[" + createPage.originalName + "]]")
              if (success) logseq.UI.showMsg(t("Create a new page"), "success")
            }, 100) 
            
            // 右サイドバーにページを開く
            logseq.Editor.openInRightSidebar(createPage.uuid)
          }
        } else {
          //ページが存在していた場合

          // 右サイドバーにページを開く
          logseq.Editor.openInRightSidebar(inputTitle)

          // メッセージを表示する
          logseq.UI.showMsg(t("The Page already exists"), "warning")
        }

        //実行されたらポップアップを削除
        removePopup()

        processing = false
      })
    }
  }
}

