import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { AppUserConfigs, PageEntity, SettingSchemaDesc, BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
//import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
//import ja from "./translations/ja.json";
import { format } from 'date-fns';
const key = "openQuickly";

/* main */
const main = () => {
  const popup = logseq.baseInfo.id + `--${key}`;
  //(async () => {
  //   try {
  //     await l10nSetup({ builtinTranslations: { ja } });
  //   } finally {
  /* user settings */
  if (!logseq.settings) {
    createPageFor("Projects", "✈️", true);
    createPageFor("Areas of responsibility", "🏠", true);
    createPageFor("Resources", "🌍", true);
    createPageFor("Archives", "🧹", true);
    createPageFor("Inbox", "📧", false);
  }
  logseq.useSettingsSchema(settingsTemplate);
  if (!logseq.settings) {
    setTimeout(() => {
      logseq.showSettingsUI();
    }
      , 300);
  }
  //   }
  //})();

  // external button on toolbar
  logseq.App.registerUIItem('toolbar', {
    key: 'openPARA',
    template: `<div id="openPARAbutton" data-rect><a class="button icon" data-on-click="openPARA" title="Open the menu for Quickly PARA Method Plugin" style="font-size:20px">⚓</a></div>`,
  });

  logseq.App.registerPageMenuItem('⚓ Open PARA method menu', () => {
    if (!parent.document.getElementById(popup)) openPARAfromToolbar();
  });


  logseq.provideModel({
    openPARA: () => {
      if (!parent.document.getElementById(popup)) openPARAfromToolbar();
    },
    Inbox: () => {
      addProperties("Inbox", "INBOX");
    },
    Projects: () => {
      addProperties("Projects", "PARA");
    },
    AreasOfResponsibility: () => {
      addProperties("Areas of responsibility", "PARA");
    },
    Resources: () => {
      addProperties("Resources", "PARA");
    },
    Archives: () => {
      addProperties("Archives", "PARA");
    },
    selectionListSendButton: () => {
      //<select id="selectionListSelect">で選択された値を取得
      const selectionListValue: string = (parent.document.getElementById('selectionListSelect') as HTMLSelectElement)!.value;
      if (selectionListValue) addProperties(selectionListValue, "Select");
    },
    NewProject: () => {
      removePopup();
      createNewPageAs('✈️ Create new project page and put inside [[Projects]]', "Projects");
    },
    NewPageInbox: () => {
      removePopup();
      createNewPageAs("📧 Create new page and put inside [[Inbox]]", "Inbox");
    },
    PARAsettingButton: () => {
      logseq.showSettingsUI();
    },
    copyPageTitleLink: () => {
      copyPageTitleLink();
    }
  });


  //slash command menu
  if (logseq.settings?.slashCommandMenu === true) {
    logseq.Editor.registerSlashCommand('📧 Put inside [[Inbox]]', async ({ uuid }) => {
      slashCommand(uuid, "Inbox", "INBOX");
    });
    logseq.Editor.registerSlashCommand('✈️ As [[Projects]] (Add to page-tags)', async ({ uuid }) => {
      slashCommand(uuid, "Projects", "PARA");
    });
    logseq.Editor.registerSlashCommand('🏠 As [[Areas of responsibility]] (Add to page-tags)', async ({ uuid }) => {
      slashCommand(uuid, "Areas of responsibility", "PARA");
    });
    logseq.Editor.registerSlashCommand('🌍 As [[Resources]] (Add to page-tags)', async ({ uuid }) => {
      slashCommand(uuid, "Resources", "PARA");
    });
    logseq.Editor.registerSlashCommand('🧹 As [[Archives]] (Add to page-tags)', async ({ uuid }) => {
      slashCommand(uuid, "Archives", "PARA");
    });
    logseq.Editor.registerSlashCommand('📧 Create new page and put inside [[Inbox]]', async () => {
      createNewPageAs("📧 Create new page and put inside [[Inbox]]", "Inbox");
    });
    logseq.Editor.registerSlashCommand('✈️ Create new project page and put inside [[Projects]]', async () => {
      createNewPageAs('✈️ New project page', "Projects");
    });
  }


  logseq.provideStyle(`
  div#${logseq.baseInfo.id}--${key} div.th h3 {
    max-width: 80%;
    text-overflow: ellipsis;
  }
  div#${popup} input {
      background: var(--ls-primary-background-color);
      color: var(--ls-primary-text-color);
      boxShadow: 1px 2px 5px var(--ls-secondary-background-color);
  }
  div#${popup} button {
      border: 1px solid var(--ls-secondary-background-color);
      boxShadow: 1px 2px 5px var(--ls-secondary-background-color);
      text-decoration: underline;
  }
  div#${popup} button:hover {
      background: var(--ls-secondary-background-color);
      color: var(--ls-secondary-text-color);
  }
  div#${popup} ul li {
    list-style: none;
    padding: 4px 8px;
    cursor: pointer;
  }
  div#${popup} ul li:hover {
    text-decoration: underline;
  }
  div#${popup} h2{
    font-size: 1.5em;
    margin-left:-.8em;
  }
  div#${popup} h3{
    font-size: 1.25em;
    margin-left:-.6em;
  }
  div#${popup} h4{
    font-size: 1.1em;
    margin-left:-.4em;
  }
  div#${popup} select#selectionListSelect {
    border-radius: 4px;
    border: 1px solid var(--ls-secondary-text-color);
    background: var(--ls-secondary-background-color);
    color: var(--ls-primary-text-color);
    margin-right: 1em;
  }
  `);

  //test


};/* end_main */



async function copyPageTitleLink() {
  const page = await logseq.Editor.getCurrentPage() as PageEntity | null;
  if (page) {
    const text: string = `[[${page.originalName}]]`;
    // focus the window
    window.focus();
    navigator.clipboard.writeText(text);
    logseq.UI.showMsg("Copy page title link", "success");
  }
}



async function getPageEntityFromBlockUuid(uuid: string) {
  const block = await logseq.Editor.getBlock(uuid) as BlockEntity | null;
  if (!block) return;
  const pageTitleRightSidebar = parent.document.querySelector(`div#right-sidebar div.sidebar-item.content:has(div[blockid="${block.uuid}"]) a.page-title`) as HTMLAnchorElement | null;
  const rightSidebar: Boolean = (pageTitleRightSidebar && pageTitleRightSidebar!.textContent) ? true : false;
  const pageTitleContentPage = parent.document.querySelector(`div#main-content-container div.content:has(div[blockid="${block.uuid}"]) :is(a.title)`) as HTMLAnchorElement | null;
  const ContentPage: Boolean = (pageTitleContentPage && pageTitleContentPage!.textContent) ? true : false;
  if (ContentPage || rightSidebar) {
    const pageTitle = rightSidebar ? pageTitleRightSidebar!.textContent : pageTitleContentPage!.textContent;
    if (pageTitle) {
      return await logseq.Editor.getPage(pageTitle as string) as PageEntity | null;
    }
  }
}

async function slashCommand(uuid: string, addProperty: string, addType: string) {
  //右サイドバーに開いたブロックからスラッシュコマンドを実行した場合の処理
  const page = await getPageEntityFromBlockUuid(uuid) as PageEntity | null;
  if (page) {
    //cancel same page
    if (page.originalName === addProperty) return logseq.UI.showMsg(`Need not add current page to page-tags.`, "warning");
    //INBOXを覗いてジャーナルはキャンセル
    if (addType !== "INBOX" && page['journal?'] === true) return logseq.UI.showMsg(`Can not add journal page to page-tags.`, "warning");
    const getCurrentTree = await logseq.Editor.getPageBlocksTree(page.originalName) as BlockEntity[] | null;
    if (getCurrentTree) await updatePageProperty(addProperty, page, addType, getCurrentTree[0].uuid);
  }
}

async function openPARAfromToolbar() {

  const SelectionList = logseq.settings!.selectionList.split(",");
  //selectを作成
  let select = `<select id="selectionListSelect" title="User Selection List">`;
  //Select hereの選択肢を作成
  select += `<option>Select here</option>`;
  for (let i = 0; i < SelectionList.length; i++) {
    if (SelectionList[i] !== "") select += `<option value="${SelectionList[i]}">${SelectionList[i]}</option>`;
  }
  select += `</select>`;
  //selectの後ろに送信ボタン
  select += `<button data-on-click="selectionListSendButton">Submit</button>`;
  let template = "";
  let height = "";
  const getPage = await logseq.Editor.getCurrentPage() as PageEntity | null;
  if (getPage) {
    template = `
  <div title="">
  <p title="The title of current page">[[${getPage.originalName}]]<button data-on-click="copyPageTitleLink" title="Copy to clipboard">📋</button></p>
  <ul>
  <li><button data-on-click="Inbox">/📧 Put inside [[Inbox]]</button></li>
  <h2>Set page-tags property</h2>

  <li>${select}</li>
  `;
    if (getPage.originalName === "Projects" || getPage.originalName === "Areas of responsibility" || getPage.originalName === "Resources" || getPage.originalName === "Archives") {
      //not show
    } else {
      template += `
  <li><button data-on-click="Projects">/✈️ As [[Projects]]</button></li>
  <li><button data-on-click="AreasOfResponsibility">/🏠 As [[Areas of responsibility]]</button></li>
  <li><button data-on-click="Resources">/🌍 As [[Resources]]</button></li>
  <li><button data-on-click="Archives">/🧹As [[Archives]]</button></li>
  `;
    }
    template += `
  </ul>
  <hr/>
      `;
    height = "690px";
  } else {
    template = `
    <div title="">
    `;
    height = "330px";
  }
  template += `
  <ul>
  <h2>Shortcut menu</h2>
  <h3>Create new page</h3>
  <li><button data-on-click="NewPageInbox">/📧 And put inside [[Inbox]]</button></li>
  <li><button data-on-click="NewProject">/✈️ And put inside [[Projects]]</button></li> 
  </ul>
  <hr/>
    <ul>
    <li><button data-on-click="PARAsettingButton"><small>Plugin Settings</small></button></li>
    <li><a href="https://github.com/YU000jp/logseq-plugin-quickly-para-method" title="To Github" target="_blank">⚓ Quickly PARA method Plugin</a></li>
    </ul>
    </div>
  `;

  logseq.provideUI({
    key,
    reset: true,
    close: "outside",
    template,
    style: {
      width: "400px",
      height,
      left: "unset",
      bottom: "unset",
      right: "1em",
      top: "4em",
      paddingLeft: "1.6em",
      paddingTop: "0.7em",
      backgroundColor: 'var(--ls-primary-background-color)',
      color: 'var(--ls-primary-text-color)',
      boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
    },
  });
}

async function createPageFor(name: string, icon: string, para: boolean) {
  const getPage = await logseq.Editor.getPage(name) as PageEntity | null;
  if (getPage === null) {
    if (para === true) {
      logseq.Editor.createPage(name, { icon, tags: "The PARA Method" }, { createFirstBlock: true, });
    } else {
      logseq.Editor.createPage(name, { icon, }, { createFirstBlock: true, });
    }
  }
}

async function createNewPageAs(title: string, tags: string) {
  logseq.provideUI({
    attrs: {
      title,
    },
    key,
    reset: true,
    template: `
        <p>New Page Title: <input id="newPageTitle" type="text" style="width:340px"/>
        <button id="CreatePageButton">Submit</button></p>
        `,
    style: {
      width: "640px",
      height: "150px",
      left: "unset",
      bottom: "unset",
      right: "1em",
      top: "4em",
      paddingLeft: "1.8em",
      paddingTop: "1.4em",
      backgroundColor: 'var(--ls-primary-background-color)',
      color: 'var(--ls-primary-text-color)',
      boxShadow: '1px 2px 5px var(--ls-secondary-background-color)',
    },
  });
  setTimeout(() => {
    const button = parent.document.getElementById("CreatePageButton") as HTMLButtonElement;
    if (button) {
      let processing: Boolean = false;
      button.addEventListener("click", async () => {
        if (processing) return;
        processing = true;
        const inputTitle = (parent.document.getElementById("newPageTitle") as HTMLInputElement).value;
        if (!inputTitle) {
          processing = false;
          return;
        }
        const obj = await logseq.Editor.getPage(inputTitle) as PageEntity | null; //ページチェック
        if (obj === null) { //ページが存在しないことを確認する
          const createPage = await logseq.Editor.createPage(inputTitle, "", { createFirstBlock: false, redirect: true });
          if (createPage) {
            const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
            await RecodeDateToPage(preferredDateFormat, tags, " [[" + createPage.originalName + "]]");
            //ページプロパティの指定
            if (tags !== "Inbox") {
              const prepend = await logseq.Editor.prependBlockInPage(createPage.uuid, "", { properties: { tags } });
              if (prepend) {
                await logseq.Editor.editBlock(prepend.uuid).catch(async () => {
                  await setTimeout(function () {
                    //ページプロパティを配列として読み込ませる処理
                    logseq.Editor.insertAtEditingCursor(",");
                    logseq.Editor.openInRightSidebar(createPage.uuid);
                    logseq.UI.showMsg("Create a new page", "success");
                  }, 200);
                });
              }
            }
          }
        } else { //ページが存在していた場合
          logseq.Editor.openInRightSidebar(inputTitle);
          logseq.UI.showMsg("The Page already exists", "warning");
        }

        //実行されたらポップアップを削除
        removePopup();
        processing = false;
      });
    }
  }, 100);
}

function removePopup() {
  const element = parent.document.getElementById(logseq.baseInfo.id + `--${key}`) as HTMLDivElement | null;
  if (element) element.remove();
}

async function addProperties(addProperty: string, addType: string) {
  removePopup();
  if (addProperty === "") return logseq.UI.showMsg(`Cancel`, "warning");//cancel

  const getCurrent = await logseq.Editor.getCurrentPage() as PageEntity | null;
  if (getCurrent) {
    //cancel same page
    if (getCurrent.name === addProperty || getCurrent.originalName === addProperty) return logseq.UI.showMsg(`Need not add current page to page-tags.`, "warning");

    const getCurrentTree = await logseq.Editor.getCurrentPageBlocksTree() as BlockEntity[] | null;
    if (getCurrentTree === null) return logseq.UI.showMsg(`Failed (Can not get the current page)`, "warning");
    await updatePageProperty(addProperty, getCurrent, addType, getCurrentTree[0].uuid);
  }
}


async function updatePageProperty(addProperty: string, getCurrent: PageEntity, addType: string, uuid: string) {
  //INBOXの場合はタグをつけない  
  if (addType !== "INBOX") await updateProperties(addProperty, "tags", getCurrent.properties, addType, uuid);
  if (
    (addType !== "PARA" && logseq.settings?.switchRecodeDate === true)
    || (addType === "PARA" && logseq.settings?.switchPARArecodeDate === true)
  ) { //指定されたPARAページに日付とリンクをつける
    const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
    await setTimeout(function () { RecodeDateToPage(preferredDateFormat, addProperty, " [[" + getCurrent.originalName + "]]"); }, 300);
  }
  if (addType !== "INBOX") {
    logseq.UI.showMsg(`As ${addProperty}`, "info");
  } else {
    logseq.UI.showMsg(`Add to ${addProperty}`, "info");
  }
}

async function RecodeDateToPage(userDateFormat, targetPageName, pushPageLink) {
  const blocks = await logseq.Editor.getPageBlocksTree(targetPageName) as BlockEntity[];
  if (blocks) {
    //PARAページの先頭行の下に追記
    let content;
    if (logseq.settings!.archivesDone === true && targetPageName === "Archives") {
      content = "DONE [[" + format(new Date(), userDateFormat) + "]]" + pushPageLink;
    } else {
      content = "[[" + format(new Date(), userDateFormat) + "]]" + pushPageLink;
    }
    await logseq.Editor.insertBlock(blocks[0].uuid, content, { sibling: false });
  } else {
    //ページが存在しない場合は作成
    const createPage = await logseq.Editor.createPage(targetPageName, "", { createFirstBlock: true, redirect: true });
    if (createPage) {
      await RecodeDateToPage(userDateFormat, targetPageName, pushPageLink);
    }
  }
}


async function updateProperties(addProperty: string, targetProperty: string, PageProperties, addType: string, firstBlockUUID: string) {
  let editBlockUUID;
  let deleteArray = ['Projects', 'Resources', 'Areas of responsibility', 'Archives'];
  if (PageProperties !== null) {
    if (typeof PageProperties === "object") {//ページプロパティが存在した場合
      for (const [key, value] of Object.entries(PageProperties)) {//オブジェクトのキーに値がない場合は削除
        if (!value) delete PageProperties[key];
      }
      if (addType === "PARA") deleteArray = deleteArray.filter(element => element !== addProperty);//PARA: 一致するもの以外のリスト
      let PropertiesArray = PageProperties[targetProperty] || [];
      if (PropertiesArray) {
        if (addType === "PARA") PropertiesArray = PropertiesArray.filter(property => !deleteArray.includes(property));//PARA: タグの重複削除
        PropertiesArray = [...PropertiesArray, addProperty];
      } else {
        PropertiesArray = [addProperty];
      }
      PropertiesArray = [...new Set(PropertiesArray)];//タグの重複削除
      await logseq.Editor.upsertBlockProperty(firstBlockUUID, targetProperty, PropertiesArray);
      editBlockUUID = firstBlockUUID;
    } else {//ページプロパティが存在しない
      const prependProperties = {};
      prependProperties[targetProperty] = addProperty;
      const prepend = await logseq.Editor.insertBlock(firstBlockUUID, "", { properties: prependProperties, sibling: true, before: true, isPageBlock: true, focus: true });
      if (prepend) {
        await logseq.Editor.moveBlock(prepend.uuid, firstBlockUUID, { before: true, children: true });
        editBlockUUID = prepend.uuid;
      }
    }
    await logseq.Editor.editBlock(editBlockUUID);
    setTimeout(function () {
      logseq.Editor.insertAtEditingCursor(",");//ページプロパティを配列として読み込ませる処理
      setTimeout(async function () {
        const property = await logseq.Editor.getBlockProperty(editBlockUUID, "icon") as string | null;
        if (property) {
          //propertyから「,」をすべて取り除く
          property.replace(/,/g, "");
          await logseq.Editor.upsertBlockProperty(editBlockUUID, "icon", property);
          let tagsProperty = await logseq.Editor.getBlockProperty(editBlockUUID, "tags") as string | null;
          if (tagsProperty) {
            //tagsPropertyの最後に「,」を追加
            await logseq.Editor.upsertBlockProperty(editBlockUUID, "tags", tagsProperty);
            logseq.Editor.insertAtEditingCursor(",");//ページプロパティを配列として読み込ませる処理
          }
        }
      }, 200);
    }, 200);
  }
  return editBlockUUID;
}


/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
const settingsTemplate: SettingSchemaDesc[] = [
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
  {//slash command menuを有効にするかどうか
    key: "slashCommandMenu",
    title: "Enable slash command menu for PARA method",
    type: "boolean",
    default: true,
    description: "`/Projects` `/Areas of responsibility` `/Resources` `/Archives` `/Inbox` (⚠️need to turn off this plugin or restart Logseq to take effect)",
  },
];

logseq.ready(main).catch(console.error);