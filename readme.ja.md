# Logseq プラグイン: *Quickly PARA method*

[English](https://github.com/YU000jp/logseq-plugin-quickly-para-method) | [日本語](https://github.com/YU000jp/logseq-plugin-quickly-para-method/blob/main/readme.ja.md)

- LogseqでPARA メソッドを用いて、ページを整理するのに役立つ ワークフローを提供します。
- Projects、Areas of responsibility、Resources、Archivesの各ページに分類するために、**ページタグとしてマークします**。

[![最新リリースバージョン](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-quickly-para-method)](https://github.com/YU000jp/logseq-plugin-quickly-para-method/releases)
[![ダウンロード数](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-quickly-para-method/total.svg)](https://github.com/YU000jp/logseq-plugin-quickly-para-method/releases)
 公開日: 2023/06/12

---

## 概要

- ツールバーのボタンもしくはページタイトルを右クリックして、専用のクイックメニューを開きます

  ![quicklyparajp](https://github.com/YU000jp/logseq-plugin-quickly-para-method/assets/111847207/9e15d931-f7a8-483e-aec0-e1511514d4ad)

* クイックメニューから選択して、現在のページもしくは新規のページに対して、Projects、Areas of responsibility、Resourceのいずれかとしてタグ付けをします
* 追加したときに、そのタグ名のページの先頭行に、日付とリンクが記帳されます
   > この機能はオプションなのでオフにできます
* 「受信トレイ」機能
   > ページを途中で中断した場合に、受信トレイのページにリンクを保存できます。月ごとに分類されます。
* 「ページ名 単語検索」機能
   > 同じ単語を持つページ名を探します。階層構造に関わらず、関連するページをリストアップします。
* サブページなどのページ作成機能
   > 現在のページの階層もしくはその上の階層にサブページを作成するための機能です。

---

## はじめに

PARA メソッドを学ぶ

> Logseq グラフ内のページを整理するのに役立ちます。
1. [文書はこちら](https://github.com/YU000jp/logseq-plugin-quickly-para-method/wiki/Learn-the-PARA-method)

Logseq マーケットプレイスからインストール
  - 上部右側のツールバーで [`---`] をクリックして [`プラグイン`] を開きます。 `マーケットプレイス` を選択します。検索フィールドに `PARA` と入力し、検索結果から選択してインストールします。

    ![画像](https://github.com/YU000jp/logseq-plugin-quickly-para-method/assets/111847207/a6d4337a-2454-4ca4-8a1d-a0d9ca4e9ac2)

### 使用方法

1. ページタグをつける方法

   - メニューまたはスラッシュコマンドから、現在のページにページタグをつけます。
   
     1. 上部ツールバーのボタン `⚓` をクリックしてメニューを開きます
        - ページが単独で開いているかどうかに応じてメニューの内容が異なります。
        > 最初、このボタンはLogseqによって非表示にされています。ツールバーのこのボタン (![アイコン](https://github.com/YU000jp/logseq-plugin-bullet-point-custom-icon/assets/111847207/136f9d0f-9dcf-4942-9821-c9f692fcfc2f)) をクリックし、その後、この(![image](https://github.com/YU000jp/logseq-plugin-quickly-para-method/assets/111847207/bfe90d5e-7ee4-4455-8b29-4c2908b1c9df)) を選択します。その後、ツールバーに ⚓ ボタンが表示されます。
     1. スラッシュコマンド
        - 日誌ページ以外でも、右サイドバーでも。
          1. `📧 Into [Inbox]`
          1. `✈️ Page-tag [Projects]`
          1. `🏠 Page-tag [Areas of responsibility]`
          1. `🌍 Page-tag [Resources]`
          1. `🧹 Page-tag [Archives]`

   ![singleJournalJa1](https://github.com/YU000jp/logseq-plugin-quickly-para-method/assets/111847207/ac4562eb-e67e-46cc-8b51-2653857cf43e)

   1. プロジェクトなどが完了しページコンテンツが進展する見込みがなくなったら、Archivesにタグ付けします。
       > その際、PARAのページタグは重複しません。Archivesにタグ付けしたら、Projectsから外れます。       

- ページの行にリストを設置する (オプション)

```clojure

{{query (page-tags [[Projects]])}}

{{query (page-tags [[Areas of responsibility]])}}

{{query (page-tags [[Resources]])}}

{{query (page-tags [[Archives]])}}

```

- プラグイン設定

   > [文書はこちら](https://github.com/YU000jp/logseq-plugin-quickly-para-method/wiki/Plugin-settings)

- おすすめのプラグイン

  1. [Favorite tree プラグイン](https://github.com/sethyuan/logseq-plugin-favorite-tree)
     > Projectsなど各ページを、ページとしてお気に入りに登録してください。そうすると、左メニューに、そのページに対してタグ付けされたページがリストアップされます。
  2. [Panel Coloring プラグイン](https://github.com/YU000jp/logseq-plugin-panel-coloring)
  3. [Page-tags and Hierarchy プラグイン](https://github.com/YU000jp/logseq-page-tags-and-hierarchy)
     > ページコンテンツ内のページタグと階層の表示位置を変更します。

---

## ショーケース / 質問 / アイデア / ヘルプ

  > [ディスカッション](https://github.com/YU000jp/logseq-plugin-quickly-para-method/discussions) タブに移動して、質問やこの種の情報を見つけるために行きます。

## 先行技術とクレジット

Logseq プラグイン > [georgeguimaraes/ add PARA properties](https://github.com/georgeguimaraes/logseq-plugin-add-PARA-properties)
  > ほぼ同様の機能を提供していますが、ページタグを使うか、独自のプロパティを使うかの違いがあります。

アイコン > [icooon-mono.com](https://icooon-mono.com/10204-%e9%8c%a8%e3%81%ae%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3%e3%81%9d%e3%81%ae4/)

製作者 > [YU000jp](https://github.com/YU000jp)

<a href="https://www.buymeacoffee.com/yu000japan" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="🍌Buy Me A Coffee 製作者にコーヒーを奢ってください!" style="height: 42px;width: 152px" ></a>
