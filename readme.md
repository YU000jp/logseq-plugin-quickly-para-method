# Logseq Plugin: *Quickly PARA Method* ⚓

[English](https://github.com/YU000jp/logseq-plugin-quickly-para-method) | [日本語](https://github.com/YU000jp/logseq-plugin-quickly-para-method/blob/main/readme.ja.md)

- Provide a workflow that helps organize pages, which tend to be large, using the PARA method.
- **Mark as a page tag** to classify it into Projects, Areas of responsibility, Resources, and Archives pages.

[![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-quickly-para-method)](https://github.com/YU000jp/logseq-plugin-quickly-para-method/releases)
[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-quickly-para-method/total.svg)](https://github.com/YU000jp/logseq-plugin-quickly-para-method/releases)
 Published 2023/06/12

---

* Image of the **PARA method**

   ![PARAイラスト](https://github.com/YU000jp/logseq-plugin-quickly-para-method/assets/111847207/17767165-679a-4572-8519-db48abfc7f30)

## Overview

* Right-click on the toolbar button or page title to open a dedicated quick menu

   ![quickMenu](https://github.com/YU000jp/logseq-plugin-quickly-para-method/assets/111847207/7cadd395-51f2-40a8-af85-3b29946af9ee)
   
1. Set page-tags property
   * Select from the quick menu to tag the current page or a new page as Projects, Areas of responsibility, or Resources
   * When added, the date and link will be recorded on the first line of the page with that tag name.
       > This feature is optional and can be turned off
   * Once a project is complete and the page content is no longer expected to evolve, tag it in Archives.
       > In that case, PARA page tags will not be duplicated. Once tag Archives, it will be removed from Projects.
1. "Inbox" feature
    > You can save a link to a page in the inbox if you leave the page midway through. Sorted by month.
1. "Page name word search" function
    > Find page names with the same word. List related pages regardless of their hierarchical structure.
1. Page creation functions such as sub page
    > This is a function to create a sub page at the current page level or at the level above it.

---

## Getting Started

Learn the PARA method

> Helps organize pages in the Logseq graph.
1. [PARA method guide](https://workflowy.com/systems/para-method/)

Install from Logseq Marketplace

  - Press [`---`] on the top right toolbar to open [`Plugins`]. Select `Marketplace`. Type `PARA` in the search field, select it from the search results and install.

   ![image](https://github.com/YU000jp/logseq-plugin-quickly-para-method/assets/111847207/a6d4337a-2454-4ca4-8a1d-a0d9ca4e9ac2)

### Usage

1. Set page-tags property

    - From quick menu or slash command

      1. Open the menu on click the top toolbar button `⚓`
        - The menu varies in its content depending on whether the single page is open or not.
        > First, the button is hidden by Logseq. Click this button (![icon](https://github.com/YU000jp/logseq-plugin-bullet-point-custom-icon/assets/111847207/136f9d0f-9dcf-4942-9821-c9f692fcfc2f)) on the toolbar. And select this (![image](https://github.com/YU000jp/logseq-plugin-quickly-para-method/assets/111847207/bfe90d5e-7ee4-4455-8b29-4c2908b1c9df)). After that, the ⚓ button will appear on the toolbar.
      1. Slash Command
        - On non-journal pages. Right sidebar too.
          1. `📧 Into [Inbox]`
          1. `✈️ Page-tag [Projects]`
          1. `🏠 Page-tag [Areas of responsibility]`
          1. `🌍 Page-tag [Resources]`
          1. `🧹 Page-tag [Archives]`

![singleJournaldemo](https://github.com/YU000jp/logseq-plugin-quickly-para-method/assets/111847207/a2c9cfb6-88a5-4af5-a90f-26b619ac53bb)

- Inline query (option)

```clojure

{{query (page-tags [[Projects]])}}

{{query (page-tags [[Areas of responsibility]])}}

{{query (page-tags [[Resources]])}}

{{query (page-tags [[Archives]])}}

```

- Plugin Settings

   > [Document here](https://github.com/YU000jp/logseq-plugin-quickly-para-method/wiki/Plugin-settings)

- Recommend plugin

  1. [Favorite tree plugin](https://github.com/sethyuan/logseq-plugin-favorite-tree)
     > To show the PARA list on left menu. Register each page of PARA to user favorites. Page tags are listed.
  1. [Panel Coloring plugin](https://github.com/YU000jp/logseq-plugin-panel-coloring)
  1. [Page-tags and Hierarchy plugin](https://github.com/YU000jp/logseq-page-tags-and-hierarchy)
     > Change the display position of page tags and hierarchy in page content.

---

## Showcase / Questions / Ideas / Help

  > Go to the [discussion](https://github.com/YU000jp/logseq-plugin-quickly-para-method/discussions) tab to ask and find this kind of things.

## Prior art & Credit

Logseq Plugin > [georgeguimaraes/ add PARA properties](https://github.com/georgeguimaraes/logseq-plugin-add-PARA-properties)
  > Although it has almost the same functionality, that plugin does not specify page tags. No date is recorded.

Icon > [icooon-mono.com](https://icooon-mono.com/10204-%e9%8c%a8%e3%81%ae%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3%e3%81%9d%e3%81%ae4/)

Author > [YU000jp](https://github.com/YU000jp)

<a href="https://www.buymeacoffee.com/yu000japan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="🍌Buy Me A Coffee" style="height: 42px;width: 152px" ></a>
