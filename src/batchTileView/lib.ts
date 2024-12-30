
import { keyLeftMenu, mainPageTitle, shortKey, toolbarIcon } from '..'


export const addLeftMenuNavHeaderForEachPARA = () => {
  const paraItems = [
    {
      icon: "&#xeae5;",
      suffix: logseq.settings!.inboxName as string,
      title: logseq.settings!.inboxName as string
    },
    {
      icon: "✈️",
      suffix: "projects",
      title: "Projects"
    },
    {
      icon: "🏠",
      suffix: "areas",
      title: "Areas of Responsibility"
    },
    {
      icon: "🌍",
      suffix: "resources",
      title: "Resources"
    },
    {
      icon: "🧹",
      suffix: "archives",
      title: "Archives"
    },
  ]

  paraItems.forEach(item => {
    if (logseq.settings!.inboxEnable === false && item.suffix === logseq.settings!.inboxName) return
    addLeftMenuNavHeader(keyLeftMenu + "-" + item.suffix, item.icon, item.title, mainPageTitle)
  })
}

const addLeftMenuNavHeader = (divId: string, icon: string, title: string, baseName: string) => {
  try {
    clearEle(divId)
  } finally {
    const leftSidebarElement = parent.document.querySelector("#left-sidebar div.nav-header") as HTMLElement | null
    if (leftSidebarElement) {
      const div = document.createElement("div")
      div.id = divId
      div.className = `${shortKey}--nav-header`
      leftSidebarElement.appendChild(div)

      const anchor = document.createElement("a")
      anchor.className = "item group flex items-center text-sm font-medium rounded-md"
      anchor.addEventListener("click", () => logseq.App.pushState('page', { name: (baseName + "/" + title) }) // ページを開く
      )
      div.appendChild(anchor)

      const spanIcon = document.createElement("span")
      spanIcon.className = "ui__icon ti ls-icon-files"
      spanIcon.textContent = icon
      anchor.appendChild(spanIcon)

      const span = document.createElement("span")
      span.className = ("flex-1")
      span.textContent = title
      anchor.appendChild(span)
    }
  }
}


export const clearEleAll = (selector: string) => {
  const ele = parent.document.body.querySelectorAll(selector) as NodeListOf<HTMLElement>
  ele.forEach((e) => e.remove())
}

export const clearEle = (selector: string) => {
  const ele = parent.document.getElementById(selector) as HTMLElement | null
  if (ele) ele.remove()
}

export const removeProvideStyle = (className: string) => {
  const doc = parent.document.head.querySelector(
    `style[data-injected-style^="${className}"]`
  ) as HTMLStyleElement
  if (doc) doc.remove()
}

