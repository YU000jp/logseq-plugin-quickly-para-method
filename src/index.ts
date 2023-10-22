import '@logseq/libs' //https://plugins-doc.logseq.com/
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json"
import { settingsTemplate } from './settings'
import { removePopup, copyPageTitleLink } from './lib'
import { createPageFor, openPARAfromToolbar, addProperties, createNewPageAs, FromSlashCommand } from './para'
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

  logseq.App.registerPageMenuItem(t("⚓ Open PARA method menu"), () => {
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
      max-width: 80%;
      text-overflow: ellipsis;
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
        font-size: 1.5em;
        margin-left: -.8em;
      }
  
      & h3 {
        font-size: 1.25em;
        margin-left: -.6em;
      }
  
      & h4 {
        font-size: 1.1em;
        margin-left: -.4em;
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


const slashCommandItems = () => {
  logseq.Editor.registerSlashCommand(t("📧 Put inside [[Inbox]]"), async ({ uuid }) => {
    FromSlashCommand(uuid, "Inbox", "INBOX")
  })
  logseq.Editor.registerSlashCommand(t("✈️ As [[Projects]] (Add to page-tags)"), async ({ uuid }) => {
    FromSlashCommand(uuid, "Projects", "PARA")
  })
  logseq.Editor.registerSlashCommand(t("🏠 As [[Areas of responsibility]] (Add to page-tags)"), async ({ uuid }) => {
    FromSlashCommand(uuid, "Areas of responsibility", "PARA")
  })
  logseq.Editor.registerSlashCommand(t("🌍 As [[Resources]] (Add to page-tags)"), async ({ uuid }) => {
    FromSlashCommand(uuid, "Resources", "PARA")
  })
  logseq.Editor.registerSlashCommand(t("🧹 As [[Archives]] (Add to page-tags)"), async ({ uuid }) => {
    FromSlashCommand(uuid, "Archives", "PARA")
  })
  logseq.Editor.registerSlashCommand(t("📧 Create new page and put inside [[Inbox]]"), async () => {
    createNewPageAs(t("📧 Create new page and put inside [[Inbox]]"), "Inbox")
  })
  logseq.Editor.registerSlashCommand(t("✈️ Create new project page and put inside [[Projects]]"), async () => {
    createNewPageAs(t("✈️ New project page"), "Projects")
  })
}


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
      if (selectionListValue) addProperties(selectionListValue, "Select")
    },
    NewProject: () => {
      removePopup()
      createNewPageAs(t('✈️ Create new project page and put inside [[Projects]]'), "Projects")
    },
    NewPageInbox: () => {
      removePopup()
      createNewPageAs(t("📧 Create new page and put inside [[Inbox]]"), "Inbox")
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