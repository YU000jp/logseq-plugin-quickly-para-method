import '@logseq/libs'; //https://plugins-doc.logseq.com/
import { logseq as PL } from "../package.json";
const pluginId = PL.id; //set plugin id from package.json
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user';
import { setup as l10nSetup, t } from "logseq-l10n"; //https://github.com/sethyuan/logseq-l10n
import ja from "./translations/ja.json";
import Swal from 'sweetalert2'; //https://sweetalert2.github.io/
import { format } from 'date-fns';

/* main */
const main = () => {
  console.info(`#${pluginId}: MAIN`); //console
  (async () => {
    try {
      await l10nSetup({ builtinTranslations: { ja } });
    } finally {
      /* user settings */
      logseq.useSettingsSchema(settingsTemplate);
      if (!logseq.settings) {
        setTimeout(() => {
          logseq.showSettingsUI();
        }
          , 300);
      }
    }
  })();

  //get theme color (For SweetAlert2)
  //checkboxなどはCSSで上書きする必要あり
  let sweetAlert2background;  //color: sweetAlert2color
  let sweetAlert2color; //background: sweetAlert2background
  const rootThemeColor = () => {
    const root = parent.document.querySelector(":root");
    if (root) {
      const rootStyles = getComputedStyle(root);
      sweetAlert2background = rootStyles.getPropertyValue("--ls-block-properties-background-color") || "#ffffff";
      sweetAlert2color = rootStyles.getPropertyValue("--ls-primary-text-color") || "#000000";
    }
  };
  rootThemeColor();
  logseq.App.onThemeModeChanged(() => { rootThemeColor(); });
  //end

  if (logseq.settings?.switchPARAfunction === true) {
    logseq.App.registerPageMenuItem("🎨 add Project", (e) => {
      addProperties("Project", "PARA", sweetAlert2background, sweetAlert2color);
    });
    logseq.App.registerPageMenuItem("🏠 add Area of responsibility", (e) => {
      addProperties("Area of responsibility", "PARA", sweetAlert2background, sweetAlert2color);
    });
    logseq.App.registerPageMenuItem("🌍 add Resource", (e) => {
      addProperties("Resource", "PARA", sweetAlert2background, sweetAlert2color);
    });
    logseq.App.registerPageMenuItem("🧹 add Archive", (e) => {
      addProperties("Archive", "PARA", sweetAlert2background, sweetAlert2color);
    });
  }
  logseq.App.registerPageMenuItem("🧺 add a page-tag by select list", (e) => {
    addProperties("", "Select", sweetAlert2background, sweetAlert2color);
  });

  //New Project Page
  logseq.App.registerPageMenuItem("🧑‍💻 create New Project", async (e) => {
    //dialog
    logseq.showMainUI();
    await Swal.fire({
      title: 'Create new project page',
      text: '',
      input: 'text',
      inputPlaceholder: 'Edit here',
      inputValue: ``,
      showCancelButton: true,
      color: sweetAlert2color,
      background: sweetAlert2background,
    }).then(async (answer) => {
      if (answer) {
        let { value: text } = answer;
        if (text) {
          const obj = await logseq.Editor.getPage(text) || [];//ページチェック
          if (Object.keys(obj).length === 0) {//ページが存在しない
            const createPage = await logseq.Editor.createPage(text, "", { createFirstBlock: false, redirect: true });
            if (createPage) {
              const userConfigs = await logseq.App.getUserConfigs();
              let userFormat = userConfigs.preferredDateFormat;
              userFormat = userFormat.replace(/E{1,3}/, "EEE");//handle same E, EE, or EEE bug
              await RecodeDateToPage(userFormat, "Project", " [[" + createPage.name + "]]");
              const prepend = await logseq.Editor.prependBlockInPage(createPage.uuid, "", { properties: { tags: "Project" } });
              if (prepend) {
                await logseq.Editor.editBlock(prepend.uuid).catch(async () => {
                  await setTimeout(async function () {
                    //ページプロパティを配列として読み込ませる処理
                    await logseq.Editor.insertAtEditingCursor(",");
                    await logseq.Editor.openInRightSidebar(createPage.uuid);
                    logseq.UI.showMsg("The page is created");
                  }, 200);
                });
              }
            }
          } else {//ページが存在していた場合
            logseq.Editor.openInRightSidebar(text);
            logseq.UI.showMsg("The Page already exists", "warning");
          }
        }

      } else {//cancel
        logseq.UI.showMsg("Cancel", "warning");
      }
    }).finally(() => {
      logseq.hideMainUI();
    });
  });

  //New child page
  logseq.App.registerPageMenuItem("🧒 create child page (for hierarchy)", async (e) => {
    const currentPage = await logseq.Editor.getCurrentPage();
    if (currentPage) {
      //dialog
      logseq.showMainUI();
      await Swal.fire({
        title: 'Create a child page',
        text: 'Edit following the current page name and slash.',
        input: 'text',
        inputPlaceholder: 'Edit here',
        inputValue: `${currentPage.name}/`,
        showCancelButton: true,
        color: sweetAlert2color,
        background: sweetAlert2background,
      }).then(async (answer) => {
        if (answer) {
          let { value: text } = answer;
          if (text) {
            if (text.endsWith("/")) {
              text = text.slice(0, -1);
            }
            if (text === `${currentPage.name}/`) {//ページ名が変更されていない
              logseq.UI.showMsg("Failed", "error");
            } else {
              const obj = await logseq.Editor.getPage(text) || [];//ページチェック
              if (Object.keys(obj).length === 0) {//ページが存在しない
                const createPage = await logseq.Editor.createPage(text, "", { createFirstBlock: false, redirect: false });
                if (createPage) {
                  const userConfigs = await logseq.App.getUserConfigs();
                  let userFormat = userConfigs.preferredDateFormat;
                  userFormat = userFormat.replace(/E{1,3}/, "EEE");//handle same E, EE, or EEE bug
                  //const ChildPageTitle = createPage.name.replace(`${currentPage.name}/`, "")
                  await RecodeDateToPage(userFormat, currentPage.name, " [[" + createPage.name + "]]");
                  logseq.Editor.openInRightSidebar(createPage.uuid);
                  logseq.UI.showMsg("The page is created");
                }
              } else {//ページが存在していた場合
                logseq.Editor.openInRightSidebar(text);
                logseq.UI.showMsg("The Page already exists", "warning");
              }
            }
          }
        } else {//cancel
          logseq.UI.showMsg("Cancel", "warning");
        }
      }).finally(() => {
        logseq.hideMainUI();
      });
    }
  });

//TODO:
//設定変更を行った場合の処理


  console.info(`#${pluginId}: loaded`);//console
};/* end_main */


async function addProperties(addProperty: string | undefined, addType: string, sweetAlert2background: string, sweetAlert2color: string) {

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
    logseq.showMainUI();
    await Swal.fire({
      text: 'Page-tags selection list',
      input: 'select',
      inputOptions: SelectionListObj,
      inputPlaceholder: 'Select a page-tag (Add to page-tags)',
      showCancelButton: true,
      color: sweetAlert2color,
      background: sweetAlert2background,
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
    return logseq.UI.showMsg(`Cancel`, "warning");//cancel
  }
  const getCurrent = await logseq.Editor.getCurrentPage();
  if (getCurrent && addProperty) {
    if (getCurrent.name === addProperty || getCurrent.originalName === addProperty) {
      return logseq.UI.showMsg(`Need not add current page to page-tags.`, "warning");//cancel same page
    }
    const getCurrentTree = await logseq.Editor.getCurrentPageBlocksTree();
    const firstBlockUUID: string = getCurrentTree[0].uuid;
    const editBlockUUID: string | undefined = await updateProperties(addProperty, "tags", getCurrent.properties, addType, firstBlockUUID);
    if (editBlockUUID) {
      if ((addType === "Select" && logseq.settings?.switchPARArecodeDate === true) || (addType === "PARA" && logseq.settings?.switchRecodeDate === true)) {//指定されたPARAページに日付とリンクをつける
        const userConfigs = await logseq.App.getUserConfigs();
        await setTimeout(function () { RecodeDateToPage(userConfigs.preferredDateFormat, addProperty, " [[" + getCurrent.name + "]]") }, 300);
      }
      logseq.UI.showMsg(`add ${addProperty} to tags`, "info");
    }
  }
}


async function RecodeDateToPage(userDateFormat, ToPageName, pushPageLink) {
  const blocks = await logseq.Editor.getPageBlocksTree(ToPageName);
  if (blocks) {
    //PARAページの先頭行の下に追記
    const content = format(new Date(), userDateFormat) + pushPageLink;
    await logseq.Editor.insertBlock(blocks[0].uuid, content, { sibling: false });
  }
}


async function updateProperties(addProperty: string, targetProperty: string, PageProperties, addType: string, firstBlockUUID: string) {
  let editBlockUUID;
  let deleteArray = ['Project', 'Resource', 'Area of responsibility', 'Archive'];
  if (typeof PageProperties === "object" && PageProperties !== null) {//ページプロパティが存在した場合
    for (const [key, value] of Object.entries(PageProperties)) {//オブジェクトのキーに値がない場合は削除
      if (!value) {
        delete PageProperties[key];
      }
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
    await logseq.Editor.insertBlock(firstBlockUUID, "", { properties: prependProperties, sibling: true, before: true, isPageBlock: true, focus: true }).then((prepend) => {
      if (prepend) {
        logseq.Editor.moveBlock(prepend.uuid, firstBlockUUID, { before: true, children: true });
        editBlockUUID = prepend.uuid;
      }
    });

  }
  await logseq.Editor.editBlock(editBlockUUID);
  await setTimeout(function () {
    logseq.Editor.insertAtEditingCursor(",");//ページプロパティを配列として読み込ませる処理
  }, 200);
  return editBlockUUID;
}


/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
const settingsTemplate: SettingSchemaDesc[] = [
  {
    key: "switchPARAfunction",
    title: "Use `page title context menu` Shortcuts for PARA method pages",
    type: "boolean",
    default: false,
    description: "",
  },
  {
    key: "switchPARArecodeDate",
    title: "Record today's date on the PARA page when adding",
    type: "boolean",
    default: true,
    description: "",
  },
  {
    key: "SelectionList",
    type: "string",
    default: `Index,`,
    title: "Use page-tags selection list",
    description: `Entry page titles separated by commas(,).`,
  },
  {
    key: "switchRecodeDate",
    title: "Record today's date on the selection page when adding",
    type: "boolean",
    default: false,
    description: "",
  },
];

logseq.ready(main).catch(console.error);