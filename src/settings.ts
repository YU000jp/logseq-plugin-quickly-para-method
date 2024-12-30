import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n

export const styleList = [
  "Tile",
  "Gallery",
  "Wide",
  "Expansion",
]

export const keySettingsPageStyle = "pageStyle"

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [

  {//ページタグをつけるかどうか
    key: "booleanRecodeOnly",
    // ページタグをつけない
    title: t("Just record without adding tags."),
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "switchPARArecodeDate",
    // PARAページの場合、最初のブロックに現在の日付とそのリンクを記録します。
    title: t("In the first block, record current date and its link. (PARA page)"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//月ごとの分類をおこなう
    key: "sortByMonth",
    title: t("Sort by month > Enable"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//上の項目がオンの場合に、それをリンクにするかどうか
    key: "sortByMonthLink",
    title: t("Sort by month > Link to the month page"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//sortByMonthSeparator
    key: "sortByMonthSeparator",
    title: t("Sort by month > Separator"),
    type: "string",
    default: ">",
    description: "default: `>`",
  },

  {
    key: "archivesDone",
    // アーカイブに記録する際に、DONEマーカーを追加します
    title: t("Archives > Add DONE marker"),
    type: "boolean",
    default: false,
    description: "",
  },

  {
    key: "slashCommandMenu",
    title: t("Slash command > Enable items"),
    type: "boolean",
    default: true,
    description: "`/Projects` `/Areas of responsibility` `/Resources` `/Archives` `/Inbox` " + t(" (⚠️To enable or disable it, restart Logseq or turn off the plugin)"),
  },

  {
    key: "pickList",
    type: "string",
    default: "Index\nReadLATER\n",
    title: t("Menu > Pick-list options"),
    // メニューの選択肢を改行で区切って記述します。`#`は不要です。
    description: t("Write the menu options separated by line breaks. `#` is not required."),
    inputAs: "textarea",
  },
  {
    key: "inboxEnable",
    type: "boolean",
    default: false,
    title: t("Inbox > Enable"),
    description: t("Enable Inbox function"),
  },
  {//INBOX ページタグをつけるかどうか
    key: "booleanInboxRecode",
    title: t("Just record without adding tags.") + ` (${t("Inbox")})`,
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "switchRecodeDate",
    // 最初のブロックに現在の日付とそのリンクを記録します。PARAページを除く
    title: t("In the first block, record current date and its link. (Except PARA page)"),
    type: "boolean",
    default: false,
    description: "",
  },
  {// Inboxのページ名を変更する
    // 変更された時、リネームを実行する
    key: "inboxName",
    type: "string",
    default: t("Inbox"),
    title: t("Change > Inbox page name"),
    description: t("default: `Inbox`"),
  },
  {
    key: "headingBatchBoard",
    type: "heading",
    title: t("Batch board configuration"),
    default: null,
    // ページタグがついたページを、embedによって一括表示するボードです。
    // ページタイトルをクリックすると、ページが開きます。
    // ページタイトルにカーソルを置くと、ツールチップが表示されます。(有効な場合)
    // アーカイブ化するには、各ページを個別に開いて、ページタグを変更してください。
    description: `

    ${t("A board that displays pages with page tags in bulk by embed.")}
    ${t("Click the page title to open the page.")}
    ${t("Hover over the page title to display a tooltip.")} (${t("If enabled")})
    
    ${t("To archive, open each page individually and change the page tag.")}
    `,
  },
  { // メインページのスタイル
    key: keySettingsPageStyle,
    title: t("Page style"),
    type: "enum",
    enumChoices: styleList,
    default: "Gallery",
    // Tile: コンテンツ最小限のスタイル
    // Gallery: 上下左右に配置するスタイル
    // Wide: 画面を横に広く使うスタイル
    // Expansion: 下側に展開するスタイル
    description: `
    
    ${t("The Tile style displays content in a minimalist manner.")}
    ${t("The Gallery style arranges the blocks up, down, left, and right.")}
    ${t("The Wide style uses the screen horizontally.")}
    ${t("The Expansion style is a style that expands on the underside.")}
    `,
  },
  {
    key: "addLeftMenu",
    type: "boolean",
    default: true,
    // 左メニューバーにボタンを追加して、このプラグインにアクセスできるようにします。
    title: t("Add a button to the left menu bar to access this plugin"),
    // ツールバーからもアクセスできます。
    description: t("Or from the toolbar"),
  },
]
