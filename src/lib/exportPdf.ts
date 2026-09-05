// Real client-side PDF export for the Gram Sabha Decision Brief.
//
// Renders the actual on-screen DOM node via html2canvas (not jsPDF's native
// text API) specifically because the brief must render Devanagari and
// Gujarati script correctly — html2canvas rasterises whatever the browser
// already shapes on screen using the loaded Noto Sans Devanagari / Gujarati
// webfonts (see index.html), which is far more reliable than re-embedding
// those fonts into jsPDF's own text layer. The trade-off (a raster image,
// not selectable text) is acceptable for a one-page printable brief.
//
// Guardrail: this never claims to issue, verify, trade, or register anything —
// it exports exactly what's on screen, including the disclaimer footer.

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ExportPdfOptions {
  filename: string;
}

export async function exportElementToPdf(element: HTMLElement, options: ExportPdfOptions): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 2, // sharp enough to read Devanagari/Gujarati conjuncts at arm's length
    useCORS: true,
    backgroundColor: '#ffffff',
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);

  // A4 in points: 595.28 x 841.89
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    // Fits on one A4 page — the required outcome for this brief.
    const yOffset = 0;
    pdf.addImage(imgData, 'JPEG', 0, yOffset, imgWidth, imgHeight);
  } else {
    // Fallback: content overflowed one page (e.g. very long translated strings) —
    // paginate rather than silently cropping content a Sarpanch needs to read.
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
  }

  pdf.save(options.filename);
}
