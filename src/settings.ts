import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [
  {
    key: "switchPARArecodeDate",
    title: t("In the first block, record today's date and a link to the PARA page."),
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "selectionList",
    type: "string",
    default: "Index,ReadLATER,",
    title: t("Page-tags Selection List"),
    description: t("Entry page titles separated by commas(,)"),
  },
  {
    key: "switchRecodeDate",
    title: t("Record today's date and a link to the page in the first block of the page."),
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "archivesDone",
    title: t("Add a DONE marker when recording on the Archives page"),
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "slashCommandMenu",
    title: t("Enable slash command items for The PARA method"),
    type: "boolean",
    default: true,
    description: "`/Projects` `/Areas of responsibility` `/Resources` `/Archives` `/Inbox` "+t(" (⚠️To enable or disable it, restart Logseq or turn off the plugin)"),
  },
]
