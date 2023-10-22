import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [
  {
    key: "switchPARArecodeDate",
    title: "Record today's date and the link to the first block of the PARA page",
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "selectionList",
    type: "string",
    default: "Index,ReadLATER,",
    title: "Use page-tags Selection List",
    description: `Entry page titles separated by commas(,)`,
  },
  {
    key: "switchRecodeDate",
    title: "Record today's date and the link to the first block of the page",
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "archivesDone",
    title: "Use a DONE marker when recording on the Archives page",
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "slashCommandMenu",
    title: "Enable slash command menu for PARA method",
    type: "boolean",
    default: true,
    description: "`/Projects` `/Areas of responsibility` `/Resources` `/Archives` `/Inbox` (⚠️need to turn off this plugin or restart Logseq to take effect)",
  },
]
