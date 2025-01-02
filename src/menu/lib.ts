// 「hls__」と「hls/」をPDF/に変換する
// 「/」を「 / 」に変換する
export const pageTitleSlash = (pageName: string) => pageName.replace("hls__", "PDF/").replace("hls/", "PDF/").replaceAll("/", " / ")
