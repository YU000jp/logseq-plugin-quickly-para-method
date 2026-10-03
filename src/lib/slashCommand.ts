import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { getPageEntityFromBlockUuid } from "../lib"
import { guardDbGraph } from '../logseqDbGraphCheck'
import { updatePageProperty } from '../menu/property'

export const slashCommandItems = () => {

  // スラッシュコマンドは、翻訳禁止！
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
}

export const run = async (uuid: string, addPropValue: string, propName: string) => {
  if (guardDbGraph()) return
  //右サイドバーに開いたブロックからスラッシュコマンドを実行した場合の処理
  const page = await getPageEntityFromBlockUuid(uuid) as { journal?: PageEntity["journal?"], originalName: PageEntity["originalName"], properties: PageEntity["properties"] } | null
  if (page) {
    //cancel same page
    if (page.originalName === addPropValue)
      return logseq.UI.showMsg(t("The current page does not need to be tagged."), "warning") // 現在のページにはタグを付ける必要がありません。
    //日誌はキャンセル
    if (page['journal?'] === true)
      return logseq.UI.showMsg(t("Journals cannot be tagged."), "warning") // 日誌にはタグを付けることができません。

    const getCurrentTree = await logseq.Editor.getPageBlocksTree(page.originalName) as BlockEntity[] | null
    //ページプロパティに追加(更新をおこなう)
    if (getCurrentTree)
      await updatePageProperty(addPropValue, page, propName, getCurrentTree[0].uuid)
  } else
    logseq.UI.showMsg(t("The current page is not found."), "warning") // 現在のページが見つかりません。
}

