import { code39Bars } from "@/lib/code39";

export type ShippingLabelPdfData = {
  asnRef: string;
  poNumber: string;
  shipToLines: string[];
  shipFromLines: string[];
  weight: string;
  dimensions: string;
  shipDate: string;
  remarks: string;
  barcode: string;
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 396;

function pdfSafe(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function textAt(x: number, y: number, size: number, value: string): string {
  return `BT /F1 ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${pdfSafe(value)}) Tj ET\n`;
}

function strokeRect(x: number, y: number, width: number, height: number, lineWidth = 2): string {
  return `${lineWidth} w ${x} ${y} ${width} ${height} re S\n`;
}

function fillRect(x: number, y: number, width: number, height: number): string {
  return `${x} ${y} ${width} ${height} re f\n`;
}

function buildContent(label: ShippingLabelPdfData): string {
  const margin = 18;
  const innerWidth = PAGE_WIDTH - margin * 2;
  const colWidth = innerWidth / 2;
  const topBottom = PAGE_HEIGHT - margin;
  const topHeight = 132;
  const midHeight = 128;
  const topY = topBottom - topHeight;
  const midY = topY - midHeight;
  const barcodeY = margin;
  const barcodeHeight = midY - barcodeY;

  const shipTo = label.shipToLines.slice(0, 4);
  const shipFrom = label.shipFromLines.slice(0, 4);
  const bars = code39Bars(label.barcode, 1.15, 2.8);
  const totalBarWidth = bars[0]?.totalWidth || 1;
  const barcodeAreaWidth = innerWidth - 48;
  const scale = barcodeAreaWidth / totalBarWidth;
  const barcodeX = margin + 24;
  const barcodeBarHeight = 52;

  let content = "0 0 0 RG\n0 0 0 rg\n";
  content += strokeRect(margin, topY, colWidth, topHeight);
  content += strokeRect(margin + colWidth, topY, colWidth, topHeight);
  content += strokeRect(margin, midY, colWidth, midHeight);
  content += strokeRect(margin + colWidth, midY, colWidth, midHeight);
  content += strokeRect(margin, barcodeY, innerWidth, barcodeHeight);

  content += fillRect(margin + 12, topBottom - 32, 78, 18);
  content += "1 1 1 rg\n";
  content += textAt(margin + 18, topBottom - 27, 10, "SHIP TO:");
  content += "0 0 0 rg\n";
  shipTo.forEach((line, index) => {
    content += textAt(margin + 14, topBottom - 56 - index * 16, 11, line);
  });

  content += textAt(margin + colWidth + 14, topBottom - 27, 10, "FROM:");
  shipFrom.forEach((line, index) => {
    content += textAt(margin + colWidth + 14, topBottom - 56 - index * 16, 11, line);
  });

  const rows: Array<[string, string]> = [
    ["ORDER ID:", label.poNumber],
    ["WEIGHT:", label.weight],
    ["DIMENSIONS:", label.dimensions],
    ["SHIPPING DATE:", label.shipDate]
  ];
  rows.forEach(([key, value], index) => {
    const y = topY - 28 - index * 28;
    content += textAt(margin + 14, y, 9, key);
    content += textAt(margin + 118, y, 11, value);
  });

  content += textAt(margin + colWidth + 14, topY - 28, 10, "REMARKS:");
  content += textAt(margin + colWidth + 14, topY - 52, 11, label.remarks || "NO REMARKS");
  content += textAt(margin + colWidth + 14, topY - 88, 9, `ASN ${label.asnRef}`);

  const barY = barcodeY + 28;
  for (const bar of bars) {
    content += fillRect(barcodeX + bar.x * scale, barY, Math.max(0.6, bar.width * scale), barcodeBarHeight);
  }
  const codeWidth = label.barcode.length * 7;
  content += textAt(
    margin + innerWidth / 2 - codeWidth / 2,
    barcodeY + 12,
    10,
    label.barcode
  );

  return content;
}

function assemblePdf(content: string): Uint8Array {
  const encoder = new TextEncoder();
  const header = "%PDF-1.4\n";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${encoder.encode(content).length} >>\nstream\n${content}\nendstream`
  ];

  let body = header;
  const offsets = [0];
  for (let index = 0; index < objects.length; index += 1) {
    offsets.push(encoder.encode(body).length);
    body += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`;
  }

  const xrefOffset = encoder.encode(body).length;
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index <= objects.length; index += 1) {
    xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  body += xref;
  body += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return encoder.encode(body);
}

export function downloadShippingLabelPdf(label: ShippingLabelPdfData): void {
  const bytes = assemblePdf(buildContent(label));
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeName = label.asnRef.replace(/[^a-zA-Z0-9._-]+/g, "-") || "label";
  link.href = url;
  link.download = `shipping-label-${safeName}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}