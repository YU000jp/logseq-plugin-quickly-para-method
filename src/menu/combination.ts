import { AppUserConfigs, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { removePopup } from '../lib'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { RecodeDateToPageTop } from '../menu/RecodePageTop'
import { updatePageProperty } from '../menu/property'

/**
 * 新しいページを作成するためのダイアログを表示する
 * 
 * @param title - ページ名
 * @param tags - タグに追加する文字列 (ページ名)
 * @param inputValue - ページのタイトルの初期値
 * @param flagNotRecode - ページを記録しない場合はtrue
 */
export const combinationNewPage = async (title: string, tags: string, inputValue: string) => {
  logseq.provideUI({
    attrs: {
      title,
    },
    key: "openQuickly",
    reset: true,
    template: `
        <p>${t("New page")}: <input id="newPageTitle" type="text" style="width:420px"${inputValue ? ` value="${inputValue}"` : ""}/>
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
        if ((await logseq.Editor.getPage(inputTitle) as { uuid: PageEntity["uuid"] } | null) === null) {

          //ページが存在しない場合に実行する
          const createPage = await logseq.Editor.createPage(
            inputTitle, // 入力されたページ名
            tags === "" || tags === logseq.settings!.inboxName ? {} //タグが空の場合や、INBOXの場合はタグを追加しない
              : { tags: [tags] }, // ページタグをつける
            {
              createFirstBlock: true, // ページの最初のブロックを作成する
              redirect: false // リダイレクトはしない
            })

          //ページが作成されなかった場合
          if (createPage === null)
            return logseq.UI.showMsg(t("Failed (Can not create a new page)"), "error")

          //ページが作成された場合
          const { preferredDateFormat } = await logseq.App.getUserConfigs() as { preferredDateFormat: AppUserConfigs["preferredDateFormat"] }

          setTimeout(async () => {
            const success: boolean = await RecodeDateToPageTop(preferredDateFormat, tags, " [[" + createPage.originalName + "]]")
            if (success) logseq.UI.showMsg(t("Create a new page"), "success")
            // 右サイドバーにページを開く
            logseq.Editor.openInRightSidebar(createPage.uuid)
          }, 100)

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


export const combinationNamespace = async (tags: string, namespaceName: string) => {

  //ページが存在しないことを確認する
  const page = await logseq.Editor.getPage(namespaceName) as { properties: PageEntity["properties"], originalName: PageEntity["originalName"], uuid: PageEntity["uuid"] } | null
  if (page) {
    //ページが存在していた場合

    ///ページタグをつける (反映処理も含まれる)
    updatePageProperty(namespaceName, page, "Free", page.uuid)
    logseq.UI.showMsg(t("The Page already exists"), "warning")

  } else {

    //ページが存在しない場合に実行する
    const createPage = await logseq.Editor.createPage(
      namespaceName, // 入力されたページ名
      { tags: [tags] }, // ページタグをつける
      {
        createFirstBlock: true, // ページの最初のブロックを作成する
        redirect: true // ページにリダイレクトする
      })

    if (createPage)
      logseq.UI.showMsg(t("Create a new page"), "success")
    else
      return logseq.UI.showMsg(t("Failed (Can not create a new page)"), "error")

  }
}