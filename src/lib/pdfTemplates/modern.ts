import autoTable from "jspdf-autotable";
import type { TemplateContext } from "./shared";
import { splitFromBlock, splitLines } from "./shared";
import { computeSubtotal, formatAmount, currencySymbol } from "../totals";
import { formatDateForDisplay } from "../dates";

export function renderModern({ doc, inv, pageWidth, pageHeight, margin }: TemplateContext) {
  const accent: [number, number, number] = [37, 99, 235];
  const accentDark: [number, number, number] = [30, 64, 175];
  const white: [number, number, number] = [255, 255, 255];
  const blackish: [number, number, number] = [17, 24, 39];
  const gray: [number, number, number] = [71, 85, 105];
  const lightTint: [number, number, number] = [239, 246, 255];

  const bandHeight = 110;
  doc.setFillColor(...accent);
  doc.rect(0, 0, pageWidth, bandHeight, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(...white);
  doc.text("INVOICE", margin, 60);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`#${inv.invoiceNumber || "—"}`, margin, 80);

  const rightX = pageWidth - margin;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("DATE", rightX - 90, 50);
  doc.text("CURRENCY", rightX - 90, 78);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(formatDateForDisplay(inv.invoiceDate), rightX, 50, {
    align: "right",
  });
  doc.text(inv.currency, rightX, 78, { align: "right" });

  let y = bandHeight + 36;

  const colWidth = (pageWidth - margin * 2 - 30) / 2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...accent);
  doc.text("FROM", margin, y);
  doc.text("BILL TO", margin + colWidth + 30, y);
  y += 14;

  const fromBlock = splitFromBlock(inv.from);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...blackish);
  doc.text(fromBlock.first || " ", margin, y);

  const billLines = splitLines(inv.billTo);
  doc.text(billLines[0] || " ", margin + colWidth + 30, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);

  const fromRest = fromBlock.rest;
  const restBill = billLines.slice(1);
  const fromYStart = y;
  fromRest.forEach((line, i) => {
    const wrapped = doc.splitTextToSize(line, colWidth);
    wrapped.forEach((w: string, j: number) =>
      doc.text(w, margin, fromYStart + (i + j) * 13)
    );
  });
  restBill.forEach((line, i) => {
    const wrapped = doc.splitTextToSize(line, colWidth);
    wrapped.forEach((w: string, j: number) =>
      doc.text(w, margin + colWidth + 30, fromYStart + (i + j) * 13)
    );
  });

  y = fromYStart + Math.max(fromRest.length, restBill.length) * 13 + 24;

  const symbol = currencySymbol(inv.currency);
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["DESCRIPTION", "AMOUNT"]],
    body: inv.items
      .filter((it) => it.description || it.amount)
      .map((it) => [it.description || "", formatAmount(it.amount)]),
    styles: {
      fontSize: 10,
      cellPadding: { top: 12, right: 14, bottom: 12, left: 14 },
      lineColor: [226, 232, 240],
      lineWidth: 0.4,
      textColor: blackish,
    },
    headStyles: {
      fillColor: accentDark,
      textColor: white,
      fontStyle: "bold",
      halign: "left",
      cellPadding: { top: 12, right: 14, bottom: 12, left: 14 },
      lineWidth: 0,
    },
    alternateRowStyles: { fillColor: lightTint },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right", cellWidth: 140 },
    },
    theme: "plain",
  });

  // @ts-expect-error autotable injects lastAutoTable
  y = doc.lastAutoTable.finalY + 16;

  const totalLabelX = pageWidth - margin - 230;
  const totalValueX = pageWidth - margin;
  doc.setFillColor(...accent);
  doc.rect(totalLabelX - 14, y - 4, 230 + 14, 34, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...white);
  doc.text(`TOTAL (${inv.currency})`, totalLabelX, y + 18);

  doc.setFontSize(16);
  doc.text(
    `${symbol}${formatAmount(computeSubtotal(inv))}`,
    totalValueX - 4,
    y + 18,
    { align: "right" }
  );

  const termsY = pageHeight - margin - 60;
  if (inv.terms && inv.terms.trim()) {
    doc.setDrawColor(...accent);
    doc.setLineWidth(1);
    doc.line(margin, termsY - 12, pageWidth - margin, termsY - 12);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...blackish);
    doc.text("Terms & Conditions", margin, termsY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...gray);
    const lines = doc.splitTextToSize(inv.terms, pageWidth - margin * 2);
    doc.text(lines, margin, termsY + 16);
  }
}
