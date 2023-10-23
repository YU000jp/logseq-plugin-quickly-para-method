import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { createNewPageAs } from './para'
import { updatePageProperty } from './property'
import { PageEntity, BlockEntity } from "@logseq/libs/dist/LSPlugin.user"
import { getPageEntityFromBlockUuid } from "./lib"

export const slashCommandItems = () => {

  // スラッシュコマンドは、翻訳禁止！

  logseq.Editor.registerSlashCommand("📧 Into [Inbox]", async ({ uuid }) => {
    run(uuid, "Inbox", "INBOX")
  })
  logseq.Editor.registerSlashCommand("✈️ Page-Tag [Projects]", async ({ uuid }) => {
    run(uuid, "Projects", "PARA")
  })
  logseq.Editor.registerSlashCommand("🏠 Page-Tag [Areas of responsibility]", async ({ uuid }) => {
    run(uuid, "Areas of responsibility", "PARA")
  })
  logseq.Editor.registerSlashCommand("🌍 Page-Tag [Resources]", async ({ uuid }) => {
    run(uuid, "Resources", "PARA")
  })
  logseq.Editor.registerSlashCommand("🧹 Page-Tag [Archives]", async ({ uuid }) => {
    run(uuid, "Archives", "PARA")
  })
  logseq.Editor.registerSlashCommand("📧 New Page / [Inbox]", async () => {
    createNewPageAs(`📧 ${t("New page / [Inbox]")}`, "Inbox")
  })
  logseq.Editor.registerSlashCommand("✈️ New Project Page / [Projects]", async () => {
    createNewPageAs(`✈️ ${t("New Project Page")}`, "Projects")
  })
}

export const run = async (uuid: string, addProperty: string, addType: string) => {
  //右サイドバーに開いたブロックからスラッシュコマンドを実行した場合の処理
  const page = await getPageEntityFromBlockUuid(uuid) as PageEntity | null
  if (page) {
    //cancel same page
    if (page.originalName === addProperty) return logseq.UI.showMsg(t("The current page does not need to be tagged."), "warning")
    //INBOXを覗いてジャーナルはキャンセル
    if (addType !== "INBOX" && page['journal?'] === true) return logseq.UI.showMsg(t("Journals cannot be tagged."), "warning")
    const getCurrentTree = await logseq.Editor.getPageBlocksTree(page.originalName) as BlockEntity[] | null
    //ページプロパティに追加(更新をおこなう)
    if (getCurrentTree) await updatePageProperty(addProperty, page, addType, getCurrentTree[0].uuid)
  }
}

