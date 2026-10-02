import { jsPDF } from 'jspdf';

export function exportDocumentToPdf(title: string, content: string, docType: string = 'Legal Document') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginLeft = 20;
  const marginRight = 20;
  const marginTop = 25;
  const marginBottom = 25;
  const contentWidth = pageWidth - marginLeft - marginRight;

  let cursorY = marginTop;

  // Header Bar / Seal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.text('LEGALEASE • VERIFIED LEGAL DOCUMENT DRAFT', marginLeft, cursorY);
  
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${dateStr}`, pageWidth - marginRight, cursorY, { align: 'right' });
  
  cursorY += 4;
  doc.setDrawColor(203, 213, 225); // Slate-300
  doc.setLineWidth(0.5);
  doc.line(marginLeft, cursorY, pageWidth - marginRight, cursorY);

  cursorY += 10;

  // Document Title
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900
  
  const titleLines = doc.splitTextToSize(title.toUpperCase(), contentWidth);
  doc.text(titleLines, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += titleLines.length * 7 + 4;

  // Subtitle / Type
  doc.setFont('times', 'italic');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Standard ${docType} Draft`, pageWidth / 2, cursorY, { align: 'center' });
  cursorY += 8;

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.line(marginLeft + 20, cursorY, pageWidth - marginRight - 20, cursorY);
  cursorY += 10;

  // Body Content
  doc.setFont('times', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(30, 41, 59);

  const paragraphs = content.split('\n');

  for (let i = 0; i < paragraphs.length; i++) {
    const rawPara = paragraphs[i].trim();

    if (!rawPara) {
      cursorY += 4; // empty line spacing
      continue;
    }

    // Check if line is a section heading (all caps, starts with number, or markdown bold)
    const isHeading = 
      /^[0-9]+\.\s+[A-Z\s]+$/.test(rawPara) ||
      /^[A-Z\s]{4,}$/.test(rawPara) ||
      rawPara.startsWith('###') ||
      rawPara.startsWith('##');

    const cleanPara = rawPara.replace(/^#+\s*/, '').replace(/\*\*/g, '');

    if (isHeading) {
      cursorY += 3;
      // Page break check before heading
      if (cursorY + 15 > pageHeight - marginBottom) {
        doc.addPage();
        cursorY = marginTop;
      }
      doc.setFont('times', 'bold');
      doc.setFontSize(11.5);
      doc.setTextColor(15, 23, 42);
      
      const wrappedHeading = doc.splitTextToSize(cleanPara, contentWidth);
      doc.text(wrappedHeading, marginLeft, cursorY);
      cursorY += wrappedHeading.length * 5.5 + 2;

      doc.setFont('times', 'normal');
      doc.setFontSize(10.5);
      doc.setTextColor(30, 41, 59);
    } else {
      const wrappedLines = doc.splitTextToSize(cleanPara, contentWidth);

      for (let j = 0; j < wrappedLines.length; j++) {
        if (cursorY + 6 > pageHeight - marginBottom) {
          doc.addPage();
          cursorY = marginTop;
        }
        doc.text(wrappedLines[j], marginLeft, cursorY);
        cursorY += 5.2;
      }
      cursorY += 2;
    }
  }

  // Footer on all pages
  const totalPages = doc.internal.pages.length - 1;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);

    doc.line(marginLeft, pageHeight - 16, pageWidth - marginRight, pageHeight - 16);
    doc.text(
      'LegalEase Draft Document • For General Information Purposes Only • Consult Legal Counsel Before Signing',
      marginLeft,
      pageHeight - 11
    );
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginRight, pageHeight - 11, { align: 'right' });
  }

  // Sanitize title for filename
  const safeFilename = title.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  doc.save(`${safeFilename || 'legal_document'}.pdf`);
}
