import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n

export const styleList = [
  "Tile",
  "Gallery",
  "Expansion",
]

export const keySettingsPageStyle = "pageStyle"

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (): SettingSchemaDesc[] => [

  {// Common settings
    key: "headingCommonSettings",
    type: "heading",
    default: null,
    title: t("Common settings"),
    description: "",
  },
  {//月ごとの分類をおこなう
    key: "sortByMonth",
    title: t("logging function") + " > " + t("Sort by month"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//上の項目がオンの場合に、それをリンクにするかどうか
    key: "sortByMonthLink",
    title: " > " + t("Sort by month") + " > " + t("Link to the month page"),
    type: "boolean",
    default: true,
    description: "",
  },
  {//sortByMonthSeparator
    key: "sortByMonthSeparator", // 区切り文字
    title: " > " + t("Sort by month") + " > " + t("Separator character"),
    type: "string",
    default: ">",
    description: "default: `>`",
  },
  {
    key: "slashCommandMenu",
    // スラッシュコマンドを有効にするかどうか
    title: t("Enable slash commands"),
    type: "boolean",
    default: true,
    description: "`/Projects` `/Areas of responsibility` `/Resources` `/Archives` ⚠️" + t("To enable or disable it, restart Logseq or turn off the plugin."),
  },


  {// PARA settings
    key: "headingPARASettings",
    type: "heading",
    default: null,
    title: `PARA ${t("settings")}`,
    description: "",
  },
  {
    key: "booleanRecodeOnly",
    //ページタグをつけない設定
    title: t("Add only date to the first block"),
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "switchPARArecodeDate",
    title: t("logging function"),
    type: "boolean",
    default: true,
    // ページの最初のブロックに日付とリンクを含めます
    description: t("Add date and link to the first block of the page"),
  },
  {
    key: "archivesDone",
    // アーカイブに記録する際に、DONEマーカーを追加します
    title: t("Archives > Add DONE marker"),
    type: "boolean",
    default: false,
    description: "",
  },


  {// Menu settings
    key: "headingMenuSettings",
    type: "heading",
    default: null,
    title: t("Menu") + " " + t("settings"),
    description: "",
  },
  {
    key: "pickList",
    type: "string",
    default: "Index\nReadLATER\n",
    title: t("Menu > Pick-list options"),
    // メニューの選択肢を改行で区切って記述します。`#`は付けないでください。
    description: t("Write the menu options separated by line breaks. Do not include `#`."),
    inputAs: "textarea",
  },


  {
    key: "headingBatchBoard",
    type: "heading",
    title: t("Board configuration"),
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
  {
    key: "addLeftMenu",
    type: "boolean",
    default: true,
    // 左メニューバーにボタンを追加して、このプラグインにアクセスできるようにします。
    title: t("Add a button to the left menu bar to access this plugin"),
    // ツールバーからもアクセスできます。
    description: "",
  },
  { // ページコンテンツを表示するかどうか
    key: "showPageContent",
    title: " > " + t("Show page content"),
    type: "boolean",
    default: true,
    // リロードすると反映されます。
    description: t("Reloading will reflect this."),
  },
  {
    key: "showLinkedReferences",
    title: " > " + t("Show linked references"),
    type: "boolean",
    default: true,
    description: t("Reloading will reflect this."),

  },
  {
    key: "headingBatchBoardIncludeWord",
    type: "heading",
    default: null,
    title: `${t("Board")} > ${t("Category by included word")}`,
    description: `${t("Classify and sort by words included in the page title. Write separated by line breaks.")}`,
  },
  {// Projectsのbatchボードの分類機能
    key: keyCommonBatchBoardIncludeWord + "Projects",
    // 含まれる単語で、分類します
    title: "Projects",
    type: "string",
    inputAs: "textarea",
    default: "",
    // ページタイトルに含まれる単語で、分類し、並び替えます。改行で区切って記述します。
    description: "",
  },
  {// Areas of responsibilityのbatchボードの分類機能
    key: keyCommonBatchBoardIncludeWord + "Areas",
    // 含まれる単語で、分類します
    title: "Areas of responsibility",
    type: "string",
    inputAs: "textarea",
    default: "",
    // ページタイトルに含まれる単語で、分類し、並び替えます。改行で区切って記述します。
    description: "",
  },
  {// Resourcesのbatchボードの分類機能
    key: keyCommonBatchBoardIncludeWord + "Resources",
    // 含まれる単語で、分類します
    title: "Resources",
    type: "string",
    inputAs: "textarea",
    default: "",
    // ページタイトルに含まれる単語で、分類し、並び替えます。改行で区切って記述します。
    description: "",
  },
  {// Archivesのbatchボードの分類機能
    key: keyCommonBatchBoardIncludeWord + "Archives",
    // 含まれる単語で、分類します
    title: "Archives",
    type: "string",
    inputAs: "textarea",
    default: "",
    // ページタイトルに含まれる単語で、分類し、並び替えます。改行で区切って記述します。
    description: "",
  },
  { // メインページのスタイル
    key: keySettingsPageStyle,
    title: t("Page style"),
    type: "enum",
    enumChoices: styleList,
    default: "Gallery",
    // Tile: コンテンツ最小限のスタイル
    // Gallery: 上下左右に配置するスタイル
    // Expansion: 下側に展開するスタイル
    description: `
    
    ${t("The Tile style displays content in a minimalist manner.")}
    ${t("The Gallery style arranges the blocks up, down, left, and right.")}
    ${t("The Expansion style is a style that expands on the underside.")}
    `,
  },
]

export const keyCommonBatchBoardIncludeWord = "BatchBoardIncludesWord"