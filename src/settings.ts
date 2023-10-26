import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [
  
  {//ページタグをつけるかどうか
    key: "booleanRecodeOnly",
    title: t("Recode > Just record without adding tags."),
    type: "boolean",
    default: false,
    description: "default: false",
  },
  {
    key: "switchRecodeDate",
    title: t("Recode > In the first block, record current date and its link. Except for the PARA page."),
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "switchPARArecodeDate",
    title: t("Recode > In the first block, record current date and its link to the PARA page."),
    type: "boolean",
    default: true,
    description: "",
  },
  {//次ごとの分類をおこなう
    key: "sortByMonth",
    title: t("Recode > Sort by month"),
    type: "boolean",
    default: true,
    description: "default: true",
  },
  {//上の項目がオンの場合に、それをリンクにするかどうか
    key: "sortByMonthLink",
    title: t("Recode > Sort by month > Link to the month page"),
    type: "boolean",
    default: true,
    description: "default: true",
  },
  {//sortByMonthSeparator
    key: "sortByMonthSeparator",
    title: t("Recode > Sort by month > Separator"),
    type: "string",
    default: ">",
    description: "default: `>`",
  },
  
  {
    key: "archivesDone",
    title: t("Recode > Add a DONE marker when recording on the Archives"),
    type: "boolean",
    default: false,
    description: "",
  },

  {
    key: "slashCommandMenu",
    title: t("Slash command > Enable items"),
    type: "boolean",
    default: true,
    description: "`/Projects` `/Areas of responsibility` `/Resources` `/Archives` `/Inbox` "+t(" (⚠️To enable or disable it, restart Logseq or turn off the plugin)"),
  },

  {
    key: "pickList",
    type: "string",
    default: "Index\nReadLATER\n",
    title: t("Menu > Pick-list options"),
    description: t("Entry page names separate by line breaks. Without `#`."),
    inputAs :"textarea",
  },

  {// Inboxのページ名を変更する
    // 変更された時、リネームを実行する
    key: "inboxName",
    type: "string",
    default: t("Inbox"),
    title: t("Change > Inbox page name"),
    description: t("default: `Inbox`"),
  },
]
