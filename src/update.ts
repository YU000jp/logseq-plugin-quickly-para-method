import { t } from "logseq-l10n"

export const update20231023ChangeSplit = () => {
  if (!logseq.settings!.breakingChanges20231023) {
    //logseq.settings!.selectionListの区切り方を、「,」から改行に変更する
    const pickList = logseq.settings!.pickList ? logseq.settings!.pickList : String(logseq.settings!.selectionList).includes(",") ? String(logseq.settings!.selectionList).replaceAll(",", "\n") : logseq.settings!.selectionList
    setTimeout(() => logseq.updateSettings({
      pickList,
      selectionList: null,
      breakingChanges20231023: true
    }),
      10)
    const dateString = new Date("2023/10/23").toLocaleDateString()
    logseq.UI.showMsg(`⚓ ${t("Quickly PARA method Plugin")}\n Big update!! ${dateString}`, "info")
  }
}
