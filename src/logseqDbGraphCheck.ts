import '@logseq/libs'

let logseqVersion: string = "" // アプリのバージョン(診断用)
let logseqDbGraph: boolean = false // 現在のグラフがDBグラフかどうか
let graphCheckSeq = 0 // グラフ切替連打時に古い検出結果で上書きしないためのシーケンス番号

export const booleanDbGraph = () => logseqDbGraph // グラフ種別チェック用
export const getLogseqVersion = () => logseqVersion // バージョンチェック用

// DBグラフ非対応の警告
export const showDbGraphIncompatibilityMsg = () =>
  logseq.UI.showMsg("The 'Quickly-PARA-Method' plugin only supports file-based graphs. It does not support DB graphs.", "warning", { timeout: 5000 })

// DBグラフ上での操作をブロックするガード (ユーザー操作の入口で使用)
export const guardDbGraph = (): boolean => {
  if (logseqDbGraph === true) {
    showDbGraphIncompatibilityMsg()
    return true
  }
  return false
}

// バージョン文字列の取得(診断用のみ。グラフ種別の判定には使わない)
export const fetchLogseqVersion = async (): Promise<void> => {
  const info = (await logseq.App.getInfo("version")) as string | null
  const m = typeof info === "string" ? info.match(/(\d+)\.(\d+)\.(\d+)/) : null
  logseqVersion = m ? m[0] : "0.0.0"
}

// グラフ種別判定(公式API。0.10.x系ホストには未実装 → null)
// 戻り値: true=DBグラフ / false=ファイルグラフ / null=検出失敗
const checkLogseqDbGraph = async (): Promise<boolean | null> => {
  try {
    const value = await (logseq.App as any).checkCurrentIsDbGraph()
    return typeof value === "boolean" ? value : null
  } catch {
    return null // API非搭載ホスト = DBグラフを開けない旧アプリ
  }
}

// 起動時の検出: 失敗(null) = 旧アプリ → ファイルグラフ扱い
export const detectDbGraphOnStartup = async (): Promise<boolean> =>
  (logseqDbGraph = (await checkLogseqDbGraph()) ?? false)

// グラフ切替時の再検出: 検出失敗(null)時は前のフラグを維持。最新の呼び出しのみ反映
export const detectDbGraphOnGraphChanged = async (): Promise<boolean> => {
  const seq = ++graphCheckSeq
  const isDb = await checkLogseqDbGraph()
  if (seq !== graphCheckSeq || isDb === null) return logseqDbGraph
  return (logseqDbGraph = isDb)
}
