import { mainPageTitleLower, shortKey } from "../."
import { keySettingsPageStyle } from '../settings'


export const handleScrolling = () => {
  const scrollTargetElement = parent.document.getElementById("main-content-container") as HTMLElement | null // スクロール対象の要素
  if (scrollTargetElement)
    scrollTargetElement.addEventListener("wheel", (ev: WheelEvent) => eventListener(scrollTargetElement, ev), { passive: false }) // ホイールイベント
  // else
  //   console.warn("mainContentContainerElement is null")
}


let processingEventListener = false
const eventListener = (scrollTargetElement: HTMLElement, ev: WheelEvent) => {
  if (processingEventListener)
    return
  processingEventListener = true

  // "body.${shortKey}-Wide"というクラスがある場合のみ処理
  if (
    parent.document.body.classList.contains(`${shortKey}-Wide`)
    && logseq.settings![keySettingsPageStyle] === "Wide"
    && parent.document.getElementById(mainPageTitleLower) as Node) {

    //console.log("activeElement", parent.document.activeElement?.classList)
    if (parent.document.activeElement?.classList.contains("normal-block")) // ブロックを編集中の場合は横スクロールをしない
    { }
    else
      if (Math.abs(ev.deltaY) < Math.abs(ev.deltaX)) // 縦より横のスクロールの方が大きい場合
      { }
      else
        if ((scrollTargetElement.scrollLeft <= 0 && ev.deltaY < 0) || (scrollTargetElement.scrollLeft >= (scrollTargetElement.scrollWidth - scrollTargetElement.clientWidth) && ev.deltaY > 0)) // スクロールが端に達した場合
          ev.preventDefault()
        else {
          ev.preventDefault()
          scrollTargetElement.scrollLeft += ev.deltaY // 横スクロール実行
        }
    //遅延処理
    setTimeout(() => processingEventListener = false, 10) // 10ms後に処理を再開

  } else {
    // イベントリスナー削除
    scrollTargetElement.removeEventListener("wheel", (ev) => eventListener(scrollTargetElement, ev))
    setTimeout(() => processingEventListener = false, 1000) // 1秒後に処理を再開
  }
}