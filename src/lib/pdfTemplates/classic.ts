import autoTable from "jspdf-autotable";
import type { TemplateContext } from "./shared";
import { splitFromBlock, splitLines } from "./shared";
import { computeSubtotal, formatAmount, currencySymbol } from "../totals";
import { formatDateForDisplay } from "../dates";

export function renderClassic({ doc, inv, pageWidth, pageHeight, margin }: TemplateContext) {
  const ink: [number, number, number] = [24, 24, 27];
  const muted: [number, number, number] = [82, 82, 91];
  const line: [number, number, number] = [161, 161, 170];
  const cream: [number, number, number] = [250, 250, 249];

  // Outer frame
  doc.setDrawColor(...ink);
  doc.setLineWidth(1.2);
  doc.rect(margin - 12, margin - 12, pageWidth - margin * 2 + 24, pageHeight - margin * 2 + 24);

  const centerX = pageWidth / 2;
  let y = margin + 24;

  const fromBlock = splitFromBlock(inv.from);
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.setTextColor(...ink);
  doc.text(fromBlock.first || " ", centerX, y, { align: "center" });

  y += 8;
  doc.setDrawColor(...ink);
  doc.setLineWidth(0.4);
  doc.line(centerX - 60, y, centerX + 60, y);

  y += 16;
  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  fromBlock.rest.forEach((l) => {
    doc.text(l, centerX, y, { align: "center" });
    y += 12;
  });

  y += 18;
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...ink);
  doc.text("INVOICE", centerX, y, { align: "center" });

  y += 24;
  // Two boxed sections: Bill To / Invoice meta
  const boxGap = 16;
  const boxWidth = (pageWidth - margin * 2 - boxGap) / 2;
  const boxHeight = 90;

  doc.setFillColor(...cream);
  doc.setDrawColor(...line);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, boxWidth, boxHeight, "FD");
  doc.rect(margin + boxWidth + boxGap, y, boxWidth, boxHeight, "FD");

  // Left box: Bill To
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...ink);
  doc.text("BILL TO", margin + 12, y + 18);

  doc.setFont("times", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...muted);
  const billLines = splitLines(inv.billTo);
  billLines.slice(0, 4).forEach((line, i) => {
    const wrapped = doc.splitTextToSize(line, boxWidth - 24);
    wrapped.slice(0, 1).forEach((w: string) =>
      doc.text(w, margin + 12, y + 36 + i * 13)
    );
  });

  // Right box: Invoice meta
  const metaX = margin + boxWidth + boxGap + 12;
  const metaValueX = margin + boxWidth + boxGap + boxWidth - 12;
  doc.setFont("times", "bold");
  doc.setTextColor(...ink);
  doc.text("INVOICE #", metaX, y + 18);
  doc.text("DATE", metaX, y + 38);
  doc.text("CURRENCY", metaX, y + 58);

  doc.setFont("times", "normal");
  doc.setTextColor(...muted);
  doc.text(inv.invoiceNumber || "", metaValueX, y + 18, { align: "right" });
  doc.text(formatDateForDisplay(inv.invoiceDate), metaValueX, y + 38, {
    align: "right",
  });
  doc.text(inv.currency, metaValueX, y + 58, { align: "right" });

  y += boxHeight + 24;

  const symbol = currencySymbol(inv.currency);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["DESCRIPTION", "AMOUNT"]],
    body: inv.items
      .filter((it) => it.description || it.amount)
      .map((it) => [it.description || "", formatAmount(it.amount)]),
    styles: {
      font: "times",
      fontSize: 11,
      cellPadding: { top: 10, right: 14, bottom: 10, left: 14 },
      lineColor: line,
      lineWidth: 0.4,
      textColor: ink,
    },
    headStyles: {
      fillColor: cream,
      textColor: ink,
      fontStyle: "bold",
      halign: "left",
      lineColor: ink,
      lineWidth: 0.6,
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right", cellWidth: 140 },
    },
    foot: [
      [
        `TOTAL (${inv.currency})`,
        `${symbol}${formatAmount(computeSubtotal(inv))}`,
      ],
    ],
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: ink,
      fontStyle: "bold",
      halign: "right",
      fontSize: 13,
      lineColor: ink,
      lineWidth: 0.6,
    },
    theme: "grid",
  });

  // Terms at bottom, centered with line above
  const termsY = pageHeight - margin - 70;
  if (inv.terms && inv.terms.trim()) {
    doc.setDrawColor(...line);
    doc.setLineWidth(0.3);
    doc.line(centerX - 60, termsY - 14, centerX + 60, termsY - 14);

    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...ink);
    doc.text("Terms & Conditions", centerX, termsY, { align: "center" });

    doc.setFont("times", "italic");
    doc.setFontSize(10);
    doc.setTextColor(...muted);
    const lines = doc.splitTextToSize(inv.terms, pageWidth - margin * 2 - 40);
    lines.forEach((l: string, i: number) =>
      doc.text(l, centerX, termsY + 16 + i * 13, { align: "center" })
    );
  }
}
