import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { AppUserConfigs, PageEntity, SettingSchemaDesc, BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
//import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
//import ja from "./translations/ja.json";
import { format } from 'date-fns';
import { get } from 'http';
const key = "openQuickly";

/* main */
const main = () => {
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


  logseq.provideModel({
    openPARA() {
      if (!parent.document.getElementById(key)) openPARAfromToolbar();
    },
    Inbox() {
      addProperties("Inbox", "");
    },
    Projects() {
      addProperties("Projects", "PARA");
    },
    AreasOfResponsibility() {
      addProperties("Areas of responsibility", "PARA");
    },
    Resources() {
      addProperties("Resources", "PARA");
    },
    Archives() {
      addProperties("Archives", "PARA");
    },
    selectionListSendButton() {
      //<select id="selectionListSelect">で選択された値を取得
      const selectionListValue: string = (parent.document.getElementById('selectionListSelect') as HTMLSelectElement)!.value;
      if (selectionListValue) addProperties(selectionListValue, "Select");
    },
    ChildPage() {
      removePopup();
      createChildPage();
    },
    NewProject() {
      removePopup();
      createNewPageAs('✈️ New project page', "Projects");
    },
    NewPageInbox() {
      removePopup();
      createNewPageAs("📧 To Inbox", "Inbox");
    },
    PARAsettingButton() {
      logseq.showSettingsUI();
    },
  });

  const popup = logseq.baseInfo.id + `--${key}`;
  logseq.provideStyle(`
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
  `);

};/* end_main */


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
  <div>
  <p title="The title of current page">[[${getPage.originalName}]]</p>
  <ul>
  <h2>Set page-tags property</h2>
  <li><button data-on-click="Inbox">to 📧[[Inbox]]</button></li>
  <li>${select}</li>
  `;
    if (getPage.originalName === "Projects" || getPage.originalName === "Area of responsibility" || getPage.originalName === "Resources" || getPage.originalName === "Archives") {
      //not show
    } else {
      template += `
  <h3 title="Organize this page using the PARA Method">The PARA method</h3>
  <li><button data-on-click="Projects">to ✈️[[Projects]]</button></li>
  <li><button data-on-click="AreasOfResponsibility">to 🏠[[Areas of responsibility]]</button></li>
  <li><button data-on-click="Resources">to 🌍[[Resources]]</button></li>
  <li><button data-on-click="Archives">to 🧹[[Archives]]</button></li>
  `;
    }
    template += `
  </ul>
  <hr/>
  <ul>
  <h2>Shortcut menu</h2>
  <h3>Create new page</h3>
  <li><button data-on-click="ChildPage">🧒 The Child Page (namespaces)</button></li>
  <li><button data-on-click="NewPageInbox">to 📧[[Inbox]]</button></li>
  <li><button data-on-click="NewProject" title="As New Project">to ✈️[[Projects]]</button></li>
  </ul>
      `;
    height = "690px";
  } else {
    template = `
    <div>
    <ul>
    <h2>Shortcut menu</h2>
    <h3>Create new page</h3>
    <li><button data-on-click="NewPageInbox">to 📧[[Inbox]]</button></li>
    <li><button data-on-click="NewProject" title="Create new page As New Project">to ✈️[[Projects]]</button></li>
    </ul>
  
        `;
    height = "330px";
  }
  template += `
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

async function createChildPage() {
  const currentPage = await logseq.Editor.getCurrentPage() as PageEntity | null;
  if (currentPage) {
    logseq.provideUI({
      attrs: {
        title: "🧒 Edit following",
      },
      key,
      reset: true,
      template: `
        <p>New Page Title: <input id="newPageTitle" type="text" style="width:340px" value="${currentPage.originalName}/"/>
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
          let inputTitle = (parent.document.getElementById("newPageTitle") as HTMLInputElement).value;
          if (!inputTitle || inputTitle === `${currentPage.originalName}/`) {
            processing = false;
            return;
          }

          if (inputTitle.endsWith("/")) inputTitle = inputTitle.slice(0, -1);
          const obj = await logseq.Editor.getPage(inputTitle) as PageEntity | null; //ページチェック
          if (obj === null) { //ページが存在しない
            const createPage = await logseq.Editor.createPage(inputTitle, "", { createFirstBlock: false, redirect: false });
            if (createPage) {
              const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
              //const ChildPageTitle = createPage.name.replace(`${currentPage.name}/`, "")
              await RecodeDateToPage(preferredDateFormat, currentPage.name, " [[" + createPage.originalName + "]]");
              logseq.Editor.openInRightSidebar(createPage.uuid);
              logseq.UI.showMsg("The page is created");
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
}

async function addProperties(addProperty: string | undefined, addType: string) {

  removePopup();

  if (addProperty === "") return logseq.UI.showMsg(`Cancel`, "warning");//cancel

  const getCurrent = await logseq.Editor.getCurrentPage() as PageEntity | null;
  if (getCurrent && addProperty) {

    //cancel same page
    if (getCurrent.name === addProperty || getCurrent.originalName === addProperty) return logseq.UI.showMsg(`Need not add current page to page-tags.`, "warning");

    const getCurrentTree = await logseq.Editor.getCurrentPageBlocksTree() as BlockEntity[] | null;
    if (getCurrentTree === null) return logseq.UI.showMsg(`Failed (Can not get the current page)`, "warning");
    const editBlockUUID: string | undefined = await updateProperties(addProperty, "tags", getCurrent.properties, addType, getCurrentTree[0].uuid);
    if (editBlockUUID) {
      if (((addType === "Select" || addType === "") && logseq.settings?.switchRecodeDate === true) || (addType === "PARA" && logseq.settings?.switchPARArecodeDate === true)) {//指定されたPARAページに日付とリンクをつける
        const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
        await setTimeout(function () { RecodeDateToPage(preferredDateFormat, addProperty, " [[" + getCurrent.originalName + "]]") }, 300);
      }
      logseq.UI.showMsg(`add ${addProperty} to tags`, "info");
    }
  } else {
    logseq.UI.showMsg(`Failed (Can not get the current page)`, "warning");
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
      if (addType === "PARA") {
        deleteArray = deleteArray.filter(element => element !== addProperty);//PARA: 一致するもの以外のリスト
      }
      let PropertiesArray = PageProperties[targetProperty] || [];
      if (PropertiesArray) {
        if (addType === "PARA") {
          PropertiesArray = PropertiesArray.filter(property => !deleteArray.includes(property));//PARA: タグの重複削除
        }
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
];

logseq.ready(main).catch(console.error);