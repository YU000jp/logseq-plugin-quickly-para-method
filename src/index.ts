import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { AppUserConfigs, PageEntity, SettingSchemaDesc, BlockEntity } from '@logseq/libs/dist/LSPlugin.user';
//import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
//import ja from "./translations/ja.json";
import Swal from 'sweetalert2'; //https://sweetalert2.github.io/
import { format } from 'date-fns';
let background;
let color;
let processing: Boolean = false;

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

  //get theme color (For SweetAlert2)
  //checkboxなどはCSSで上書きする必要あり
  const rootThemeColor = () => {
    const root = parent.document.querySelector(":root");
    if (root) {
      const rootStyles = getComputedStyle(root);
      background = rootStyles.getPropertyValue("--ls-block-properties-background-color") || "#ffffff";
      color = rootStyles.getPropertyValue("--ls-primary-text-color") || "#000000";
      setTimeout(() => {
        const inner = document.getElementById("inner") as HTMLDivElement;
        inner!.style.background = background;
        inner!.style.color = color;
      }, 100);
    }
  };
  rootThemeColor();
  logseq.App.onThemeModeChanged(() => {
    rootThemeColor();
  });
  //end


  const app = document.getElementById('app') as HTMLDivElement;
  const container = document.createElement('div') as HTMLDivElement;
  container.id = 'inner';
  container.innerHTML = `
<ul id="displayPARA">
<h4 id="thisPage" title="current page name"></h4>
<hr/>
<h2 title="Organize this page using the PARA Method">Set page-tags property</h2>
<li id="Inbox">to 📧[[Inbox]]</li>
<li id="Select">User Selection List</li>
<h3>The PARA method</h3>
<li id="Projects">to ✈️[[Projects]]</li>
<li id="AreasOfResponsibility">to 🏠[[Areas of responsibility]]</li>
<li id="Resources">to 🌍[[Resources]]</li>
<li id="Archives">to 🧹[[Archives]]</li>
</ul>
<hr/>
<ul>
<h2>Shortcut menu</h2>
<h3>Create new page</h3>
<li id="ChildPage">🧒 The Child Page (namespaces)</li>
<li id="NewPageInbox">to 📧[[Inbox]]</li>
<li id="NewProject" title="As New Project">to 🎨[[Projects]]</li>
</ul>
<hr/>
<ul>
<li><button id="PARAcloseButton">Close</button></li>
<li><small><a id="PARAsettingButton">Plugin Settings</a></small></li>
<h4>⚓ Quickly PARA method Plugin</h4>
</ul>
<style>
div#app {
  z-index: -1;
}
div#inner {
  position: fixed;
  right: 10px;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  padding: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  z-index: 11;
}
div#inner ul li {
  list-style: none;
  padding: 4px 8px;
  cursor: pointer;
}
div#inner ul li:hover {
  text-decoration: underline;
}
button#PARAcloseButton {
  font-size: 1.2em;
  padding: 4px 8px;
  cursor: pointer;
}
</style>
`;
  app.appendChild(container);

  logseq.provideModel({
    async openPARA() {
      const getPage = await logseq.Editor.getCurrentPage() as PageEntity | null;
      if (getPage) {
        document.getElementById('displayPARA')!.style.display = "block";
        document.getElementById('ChildPage')!.style.display = "block";
        document.getElementById('Select')!.style.display = "block";
        document.getElementById('thisPage')!.innerHTML = `[[${getPage.originalName}]]`;
      } else {
        document.getElementById('displayPARA')!.style.display = "none";
        document.getElementById('ChildPage')!.style.display = "none";
        document.getElementById('Select')!.style.display = "none";
      }
      const rect = await logseq.App.queryElementRect('#openPARAbutton') as DOMRectReadOnly;
      const inner = document.getElementById('inner') as HTMLDivElement;
      inner.style.top = `${rect.top + 30}px`;
      (document.getElementById('PARAcloseButton') as HTMLButtonElement)!.addEventListener('click', () => {
        logseq.hideMainUI();
      });
      (document.getElementById('Inbox') as HTMLLIElement)!.addEventListener('click', () => {
        logseq.hideMainUI();
        addProperties("Inbox", "");
      });
      (document.getElementById('Projects') as HTMLLIElement)!.addEventListener('click', () => {
        logseq.hideMainUI();
        addProperties("Projects", "PARA");
      });
      (document.getElementById('AreasOfResponsibility') as HTMLLIElement)!.addEventListener('click', () => {
        logseq.hideMainUI();
        addProperties("Areas of responsibility", "PARA");
      });
      (document.getElementById('Resources') as HTMLLIElement)!.addEventListener('click', () => {
        logseq.hideMainUI();
        addProperties("Resources", "PARA");
      });
      (document.getElementById('Archives') as HTMLLIElement)!.addEventListener('click', () => {
        logseq.hideMainUI();
        addProperties("Archives", "PARA");
      });
      (document.getElementById('Select') as HTMLLIElement)!.addEventListener('click', () => {
        addProperties("", "Select");
      });
      (document.getElementById('ChildPage') as HTMLLIElement)!.addEventListener('click', () => {
        createChildPage();
      });
      (document.getElementById('NewProject') as HTMLLIElement)!.addEventListener('click', () => {
        createNewPageAs('Create new project page', "Projects");
      });
      (document.getElementById('NewPageInbox') as HTMLLIElement)!.addEventListener('click', () => {
        createNewPageAs("Create new page to Inbox", "Inbox");
      });
      (document.getElementById('PARAsettingButton') as HTMLAnchorElement)!.addEventListener('click', () => {
        logseq.hideMainUI();
        logseq.showSettingsUI();
      });
      logseq.showMainUI();
    },
  });

  // external button on toolbar
  logseq.App.registerUIItem('toolbar', {
    key: 'openPARA', template: `<div title="Open the menu for Quickly PARA Method Plugin" data-on-click="openPARA" style="font-size:20px" id="openPARAbutton" data-rect>⚓</div>`,
  });


};/* end_main */


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
  if (processing === true) return;
  processing = true;
  await Swal.fire({
    title,
    input: 'text',
    inputPlaceholder: 'Edit here',
    inputValue: ``,
    showCancelButton: true,
    color: color,
    background: background,
  }).then(async (answer) => {
    if (answer) {
      let { value: text } = answer;
      if (text) {
        const obj = await logseq.Editor.getPage(text) as PageEntity | null; //ページチェック
        if (obj === null) { //ページが存在しない
          const createPage = await logseq.Editor.createPage(text, "", { createFirstBlock: false, redirect: true });
          if (createPage) {
            const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
            await RecodeDateToPage(preferredDateFormat, tags, " [[" + createPage.originalName + "]]");
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
          logseq.Editor.openInRightSidebar(text);
          logseq.UI.showMsg("The Page already exists", "warning");
        }
      }

    } else { //cancel
      logseq.UI.showMsg("Cancel", "warning");
    }
  }).finally(() => {
    logseq.hideMainUI();
    processing = false;
  });

}

async function createChildPage() {
  if (processing === true) return;
  processing = true;
  const currentPage = await logseq.Editor.getCurrentPage() as PageEntity | null;
  if (currentPage) {
    //dialog
    await Swal.fire({
      title: 'Create a child page',
      text: 'Edit following the current page name and slash.',
      input: 'text',
      inputPlaceholder: 'Edit here',
      inputValue: `${currentPage.originalName}/`,
      showCancelButton: true,
      color,
      background,
    }).then(async ({ value }) => {
      if (value) {
        let text = value;
        if (text.endsWith("/")) {
          text = text.slice(0, -1);
        }
        if (text === `${currentPage.originalName}/`) { //ページ名が変更されていない
          logseq.UI.showMsg("Failed", "error");
        } else {
          const obj = await logseq.Editor.getPage(text) as PageEntity | null; //ページチェック
          if (obj === null) { //ページが存在しない
            const createPage = await logseq.Editor.createPage(text, "", { createFirstBlock: false, redirect: false });
            if (createPage) {
              const { preferredDateFormat } = await logseq.App.getUserConfigs() as AppUserConfigs;
              //const ChildPageTitle = createPage.name.replace(`${currentPage.name}/`, "")
              await RecodeDateToPage(preferredDateFormat, currentPage.name, " [[" + createPage.originalName + "]]");
              logseq.Editor.openInRightSidebar(createPage.uuid);
              logseq.UI.showMsg("The page is created");
            }
          } else { //ページが存在していた場合
            logseq.Editor.openInRightSidebar(text);
            logseq.UI.showMsg("The Page already exists", "warning");
          }
        }
      } else { //cancel
        logseq.UI.showMsg("Cancel", "warning");
      }
    }).finally(() => {
      logseq.hideMainUI();
      processing = false;
    });
  } else {
    logseq.UI.showMsg("Failed (Can not get the current page)", "warning");
    processing = false;
  }

}

async function addProperties(addProperty: string | undefined, addType: string) {
  if (processing === true) return;
  processing = true;
  //リスト選択モード
  if (addType === "Select") {
    let SettingSelectionList = logseq.settings?.SelectionList || "";
    if (SettingSelectionList === "") {
      return logseq.UI.showMsg(`Please set the selection list first`, "warning");//cancel
    }
    SettingSelectionList = SettingSelectionList.split(",");
    const SelectionListObj = {};
    for (let i = 0; i < SettingSelectionList.length; i++) {
      if (SettingSelectionList[i]) {
        SelectionListObj[`${SettingSelectionList[i]}`] = SettingSelectionList[i];
      }
    }
    //dialog
    await Swal.fire({
      title: 'Page-tags Selection list',
      input: 'select',
      inputOptions: SelectionListObj,
      inputPlaceholder: 'Select a page-tag',
      showCancelButton: true,
      color,
      background,
    }).then((answer) => {
      if (answer) {
        const { value: select } = answer;
        if (select) {
          addProperty = select;//ページタグ確定
        }
      }
    }).finally(() => {
      logseq.hideMainUI();
    });
  }
  if (addProperty === "") {
    processing = false;
    return logseq.UI.showMsg(`Cancel`, "warning");//cancel
  }
  const getCurrent = await logseq.Editor.getCurrentPage() as PageEntity | null;
  if (getCurrent && addProperty) {
    if (getCurrent.name === addProperty || getCurrent.originalName === addProperty) {
      return logseq.UI.showMsg(`Need not add current page to page-tags.`, "warning");//cancel same page
    }
    const getCurrentTree = await logseq.Editor.getCurrentPageBlocksTree();
    const firstBlockUUID: string = getCurrentTree[0].uuid;
    const editBlockUUID: string | undefined = await updateProperties(addProperty, "tags", getCurrent.properties, addType, firstBlockUUID);
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
  processing = false;
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
    key: "SelectionList",
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