import '@logseq/libs' //https://plugins-doc.logseq.com/
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json"
import { settingsTemplate } from './settings'
import { removePopup, copyPageTitleLink } from './lib'
import { createPageForPARA, openPARAfromToolbar } from './para'
import { runCommand } from './property'
import { slashCommandItems } from './slashCommand'
import { combinationNewPage } from './combination'
export const key = "openQuickly"

/* main */
const main = async () => {
  const popup = logseq.baseInfo.id + `--${key}`
  await l10nSetup({ builtinTranslations: { ja } })
  /* user settings */
  if (!logseq.settings) {
    createPageForPARA("Projects", "✈️", true)
    createPageForPARA("Areas of responsibility", "🏠", true)
    createPageForPARA("Resources", "🌍", true)
    createPageForPARA("Archives", "🧹", true)
    createPageForPARA("Inbox", "📧", false)
  }
  logseq.useSettingsSchema(settingsTemplate())
  if (!logseq.settings) setTimeout(() => logseq.showSettingsUI(), 300)



  //Update 2023/10/23

  if (!logseq.settings!.breakingChanges20231023) {
    //logseq.settings!.selectionListの区切り方を、「,」から改行に変更する
    const pickList = logseq.settings!.pickList ? logseq.settings!.pickList : String(logseq.settings!.selectionList).includes(",") ? String(logseq.settings!.selectionList).replaceAll(",","\n") : logseq.settings!.selectionList
    setTimeout(() => 
      logseq.updateSettings({
        pickList,
        selectionList: null,
        breakingChanges20231023: true
      })
    , 10)

    const dateString = new Date("2023/10/23").toLocaleDateString()
    logseq.UI.showMsg(`⚓ ${t("Quickly PARA method Plugin")}\n Big update!! ${dateString}`, "info")
  }


  // external button on toolbar
  logseq.App.registerUIItem('toolbar', {
    key: 'openPARA',
    template: `<div id="openPARAbutton" data-rect><a class="button icon" data-on-click="openPARA" title="${t("Open PARA method menu")}" style="font-size:18px">⚓</a></div>`,
  })

  logseq.App.registerPageMenuItem(`⚓ ${t("Open PARA method menu")}`, () => {
    if (!parent.document.getElementById(popup)) openPARAfromToolbar()
  })


  // Model
  model(popup)


  //slash command menu
  if (logseq.settings?.slashCommandMenu === true) slashCommandItems()


  logseq.provideStyle(`
body>div{
  &#root>div>main {
    & article>div[data-id="${logseq.baseInfo.id}"] {
      & div.heading-item {
        margin-top: 3em;
        border-top-width: 1px;
        padding-top: 1em;
      }

      & label.form-control {
        &>input[type="text"].form-input {
          width: 100px;
          font-size: 1.3em;
        }

        &>textarea.form-input {
          width: 350px;
          height: 9em;
        }
      }
    }
  }
  &#${popup}  {
    &>div {
      &.draggable-handle>div.th h3 {
        font-size: .9em;
      }
      &.ls-ui-float-content>div {
        padding-top: 1em;
        padding-bottom: .5em;

        & li.para-away {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-right: 1em;
        }

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
            text-decoration: unset;
          }
        }
    
        & h2 {
          font-size: 1.3em;
          margin-left: -.8em;
          margin-bottom: .5em;
        }
    
        & h3 {
          font-size: 1em;
          margin-left: -.6em;
        }
    
        & select#pickListSelect {
          border-radius: 4px;
          border: 1px solid var(--ls-secondary-text-color);
          background: var(--ls-secondary-background-color);
          color: var(--ls-primary-text-color);
          margin-top : .5em;
        }
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
      runCommand("Inbox", "INBOX")
    },
    Projects: () => {
      runCommand("Projects", "PARA")
    },
    AreasOfResponsibility: () => {
      runCommand("Areas of responsibility", "PARA")
    },
    Resources: () => {
      runCommand("Resources", "PARA")
    },
    Archives: () => {
      runCommand("Archives", "PARA")
    },
    pickListTagSubmitButton: () => {
      //<select id="pickListSelect">で選択された値を取得
      const selectionListValue: string = (parent.document.getElementById('pickListSelect') as HTMLSelectElement)!.value
      if (selectionListValue !== "") runCommand(selectionListValue, "Select")
    },
    NewProject: () => {
      removePopup()
      combinationNewPage(`✈️ ${t("New Project Page")} / [Projects]`, "Projects")
    },
    NewPageInbox: () => {
      removePopup()
      combinationNewPage(`📧 ${t("New page / [Inbox]")}`, "Inbox")
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