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

export const update20250118Change = () => {
  const keyword = "breakingChanges20250118"
  if (!logseq.settings![keyword]) {
    logseq.Editor.deletePage("Quickly-PARA-Method-Plugin/Areas of Responsibility")
    setTimeout(() =>
      logseq.updateSettings({ [keyword]: true })
      , 10)
    logseq.UI.showMsg("Fixed a bug regarding The board functionality. Some caches have been removed. You may need to reload on the board.\n\nQuickly PARA Method plugin", "info", { timeout: 5000 })
    setTimeout(() =>
      logseq.Editor.createPage("Quickly-PARA-Method-Plugin/Areas of responsibility", { public: false }, { redirect: false, createFirstBlock: true, journal: false })
      , 1000)
  }
}
