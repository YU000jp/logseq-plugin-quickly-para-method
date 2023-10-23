import '@logseq/libs' //https://plugins-doc.logseq.com/
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json"
import { settingsTemplate } from './settings'
import { removePopup, copyPageTitleLink } from './lib'
import { createPageFor, openPARAfromToolbar, addProperties, createNewPageAs } from './para'
import { slashCommandItems } from './slashCommand'
export const key = "openQuickly"

/* main */
const main = async () => {
  const popup = logseq.baseInfo.id + `--${key}`
  await l10nSetup({ builtinTranslations: { ja } })
  /* user settings */
  if (!logseq.settings) {
    createPageFor("Projects", "✈️", true)
    createPageFor("Areas of responsibility", "🏠", true)
    createPageFor("Resources", "🌍", true)
    createPageFor("Archives", "🧹", true)
    createPageFor("Inbox", "📧", false)
  }
  logseq.useSettingsSchema(settingsTemplate())
  if (!logseq.settings) setTimeout(() => logseq.showSettingsUI(), 300)
  //   }
  //})();

  // external button on toolbar
  logseq.App.registerUIItem('toolbar', {
    key: 'openPARA',
    template: `<div id="openPARAbutton" data-rect><a class="button icon" data-on-click="openPARA" title="${t("Open the menu for Quickly PARA Method Plugin")}" style="font-size:20px">⚓</a></div>`,
  })

  logseq.App.registerPageMenuItem(`⚓ ${t("Open PARA method menu")}`, () => {
    if (!parent.document.getElementById(popup)) openPARAfromToolbar()
  })


  // Model
  model(popup)


  //slash command menu
  if (logseq.settings?.slashCommandMenu === true) slashCommandItems()


  logseq.provideStyle(`
body>div#${popup}  {
  &>div {
    &.draggable-handle>div.th h3 {
      max-width: max-content;
      text-overflow: ellipsis;
      font-size: .9em;
    }
    &.ls-ui-float-content>div {
      & input {
        background-color: var(--ls-primary-background-color);
        color: var(--ls-primary-text-color);
        box-shadow: 1px 2px 5px var(--ls-secondary-background-color);
      }
  
      & button {
        border: 1px solid var(--ls-secondary-background-color);
        box-shadow: 1px 2px 5px var(--ls-secondary-background-color);
        text-decoration: underline;
  
        &:hover {
          background-color: var(--ls-secondary-background-color);
          color: var(--ls-secondary-text-color);
        }
      }
  
      & ul li {
        list-style: none;
        padding: 4px 8px;
        cursor: pointer;
  
        &:hover {
          text-decoration: underline;
        }
      }
  
      & h2 {
        font-size: 1.3em;
        margin-left: -.8em;
      }
  
      & h3 {
        font-size: 1em;
        margin-left: -.6em;
      }
  
      & select#selectionListSelect {
        border-radius: 4px;
        border: 1px solid var(--ls-secondary-text-color);
        background: var(--ls-secondary-background-color);
        color: var(--ls-primary-text-color);
        margin-right: 1em;
      }
    }
  }
}
  `)

}/* end_main */


const model = (popup: string) => {
  logseq.provideModel({
    openPARA: () => {
      if (!parent.document.getElementById(popup)) openPARAfromToolbar()
    },
    Inbox: () => {
      addProperties("Inbox", "INBOX")
    },
    Projects: () => {
      addProperties("Projects", "PARA")
    },
    AreasOfResponsibility: () => {
      addProperties("Areas of responsibility", "PARA")
    },
    Resources: () => {
      addProperties("Resources", "PARA")
    },
    Archives: () => {
      addProperties("Archives", "PARA")
    },
    selectionListSendButton: () => {
      //<select id="selectionListSelect">で選択された値を取得
      const selectionListValue: string = (parent.document.getElementById('selectionListSelect') as HTMLSelectElement)!.value
      if (selectionListValue !== "") addProperties(selectionListValue, "Select")
    },
    NewProject: () => {
      removePopup()
      createNewPageAs(`✈️ ${t("New Project Page")} / [Projects]`, "Projects")
    },
    NewPageInbox: () => {
      removePopup()
      createNewPageAs(`📧 ${t("New page / [Inbox]")}`, "Inbox")
    },
    PARAsettingButton: () => {
      logseq.showSettingsUI()
    },
    copyPageTitleLink: () => {
      copyPageTitleLink()
    }
  })
}

logseq.ready(main).catch(console.error)