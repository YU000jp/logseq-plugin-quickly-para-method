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
]
