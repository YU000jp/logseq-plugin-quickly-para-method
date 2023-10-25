import { AppUserConfigs, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { removePopup } from './lib'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { RecodeDateToPage } from './property'


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
  setTimeout(() => {
    const button = parent.document.getElementById("CreatePageButton") as HTMLButtonElement
    if (button) {
      let processing: Boolean = false
      button.addEventListener("click", async () => {
        if (processing) return
        processing = true
        const inputTitle = (parent.document.getElementById("newPageTitle") as HTMLInputElement).value
        if (!inputTitle) {
          processing = false
          return
        }
        if ((await logseq.Editor.getPage(inputTitle) as PageEntity | null) === null) { //ページが存在しないことを確認する
          const createPage = await logseq.Editor.createPage(inputTitle, "", { createFirstBlock: false, redirect: true })
          if (createPage) {
            const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs
            await RecodeDateToPage(preferredDateFormat, tags, " [[" + createPage.originalName + "]]")
            //ページプロパティの指定
            if (tags !== "Inbox") {
              const prepend = await logseq.Editor.prependBlockInPage(createPage.uuid, "", { properties: { tags } })
              if (prepend) {
                await logseq.Editor.editBlock(prepend.uuid).catch(async () => {
                  await setTimeout(function () {
                    //ページプロパティを配列として読み込ませる処理
                    logseq.Editor.insertAtEditingCursor(",")
                    logseq.Editor.openInRightSidebar(createPage.uuid)
                    logseq.UI.showMsg(t("Create a new page"), "success")
                  }, 200)
                })
              }
            }
          }
        } else { //ページが存在していた場合
          logseq.Editor.openInRightSidebar(inputTitle)
          logseq.UI.showMsg(t("The Page already exists"), "warning")
        }

        //実行されたらポップアップを削除
        removePopup()
        processing = false
      })
    }
  }, 100)
}
