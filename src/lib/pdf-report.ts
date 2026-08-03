'use client';

export interface PDFReportRow {
  label: string;
  value: string;
}

export interface PDFReportSection {
  heading: string;
  lines: string[];
}

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  generatedAt: string;
  rows: PDFReportRow[];
  sections: PDFReportSection[];
}

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;
const LINE_HEIGHT = 15;
const MAX_LINES_PER_PAGE = 44;
const MAX_CHARS = 88;

const toAscii = (value: string): string => {
  return value
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[\u2022\u00B7]/g, '*')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
};

const wrapText = (text: string, max = MAX_CHARS): string[] => {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let current = '';
  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current + ' ' + word).length <= max) {
      current += ' ' + word;
    } else {
      out.push(current);
      current = word;
    }
  }
  if (current) out.push(current);
  return out.length ? out : [''];
};

const buildContentStream = (lines: { text: string; bold: boolean }[]): string => {
  const ops: string[] = [];
  lines.forEach((line, index) => {
    const y = PAGE_HEIGHT - MARGIN - index * LINE_HEIGHT;
    ops.push('BT', `/F${line.bold ? 2 : 1} ${line.bold ? 13 : 11} Tf`, `${MARGIN} ${y} Td`, `(${toAscii(line.text)}) Tj`, 'ET');
  });
  return ops.join('\n');
};

export function buildPDFReport(opts: PDFReportOptions): Blob {
  const lines: { text: string; bold: boolean }[] = [];
  lines.push({ text: opts.title, bold: true });
  if (opts.subtitle) lines.push({ text: opts.subtitle, bold: false });
  lines.push({ text: `Generated: ${opts.generatedAt}`, bold: false });
  lines.push({ text: '', bold: false });

  if (opts.rows.length > 0) {
    lines.push({ text: 'BASIC INFORMATION', bold: true });
    opts.rows.forEach((r) => lines.push({ text: `${r.label}: ${r.value}`, bold: false }));
    lines.push({ text: '', bold: false });
  }

  opts.sections.forEach((section) => {
    lines.push({ text: section.heading, bold: true });
    section.lines.forEach((line) => {
      wrapText(line).forEach((w) => lines.push({ text: w, bold: false }));
    });
    lines.push({ text: '', bold: false });
  });

  const pages: { text: string; bold: boolean }[][] = [];
  for (let i = 0; i < lines.length; i += MAX_LINES_PER_PAGE) {
    pages.push(lines.slice(i, i + MAX_LINES_PER_PAGE));
  }
  if (pages.length === 0) pages.push([]);

  const objs: string[] = ['', ''];
  objs[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objs[2] = `<< /Type /Pages /Kids [${pages.map((_, i) => `${5 + i * 2} 0 R`).join(' ')}] /Count ${pages.length} >>`;
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>';
  objs[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>';

  pages.forEach((pageLines, i) => {
    const pageId = 5 + i * 2;
    const contentId = 6 + i * 2;
    const stream = buildContentStream(pageLines);
    objs[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`;
    objs[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  });

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let i = 1; i < objs.length; i++) {
    offsets[i] = pdf.length;
    pdf += `${i} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xrefPos = pdf.length;
  let xref = `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objs.length; i++) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += xref;
  pdf += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function downloadPDFBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function downloadPDFReport(opts: PDFReportOptions, filename: string) {
  downloadPDFBlob(buildPDFReport(opts), filename);
}
