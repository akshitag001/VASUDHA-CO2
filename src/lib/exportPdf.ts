// Image-based PDF of the brief, for browsers where "Print → Save as PDF" is awkward.
// html2canvas and jsPDF are loaded only when the button is pressed.
// html2canvas rasterises the page as the browser shapes it, so Devanagari and
// Gujarati conjuncts come out right as long as the web fonts have loaded and no
// letter-spacing is applied (letter-spacing makes html2canvas draw glyph by glyph).

export async function exportElementToPdf(el: HTMLElement, filename: string): Promise<void> {
  await document.fonts.ready
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  const canvas = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 210
  const pageH = 297
  const margin = 10
  const w = pageW - margin * 2
  const h = (canvas.height * w) / canvas.width
  const img = canvas.toDataURL('image/jpeg', 0.92)
  if (h <= pageH - margin * 2) {
    pdf.addImage(img, 'JPEG', margin, margin, w, h)
  } else {
    // Scale down to fit one page rather than splitting text across pages.
    const scale = (pageH - margin * 2) / h
    pdf.addImage(img, 'JPEG', margin + (w - w * scale) / 2, margin, w * scale, h * scale)
  }
  pdf.save(filename)
}
