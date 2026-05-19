import autoTable from "jspdf-autotable";
import type { TemplateContext } from "./shared";
import { splitFromBlock, splitLines } from "./shared";
import { computeSubtotal, formatAmount, currencySymbol } from "../totals";
import { formatDateForDisplay } from "../dates";

export function renderMinimal({ doc, inv, pageWidth, pageHeight, margin }: TemplateContext) {
  const rightX = pageWidth - margin;
  const blackish: [number, number, number] = [17, 24, 39];
  const gray: [number, number, number] = [55, 65, 81];
  const lightGray: [number, number, number] = [243, 244, 246];
  const border: [number, number, number] = [229, 231, 235];

  let y = margin + 30;

  const fromBlock = splitFromBlock(inv.from);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...blackish);
  doc.text(fromBlock.first || " ", margin, y);

  doc.text("INVOICE", rightX, y, { align: "right" });

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  fromBlock.rest.forEach((line) => {
    doc.text(line, margin, y);
    y += 14;
  });

  y += 40;

  const billToY = y;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...blackish);
  doc.text("Bill To", margin, billToY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  let billY = billToY + 16;
  splitLines(inv.billTo).forEach((line) => {
    const wrapped = doc.splitTextToSize(line, (pageWidth - margin * 2) / 2 - 20);
    wrapped.forEach((w: string) => {
      doc.text(w, margin, billY);
      billY += 14;
    });
  });

  const metaLabelX = rightX - 130;
  const metaValueX = rightX;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...blackish);
  doc.text("Invoice #", metaLabelX, billToY);
  doc.text("Invoice Date", metaLabelX, billToY + 16);
  doc.text("Currency", metaLabelX, billToY + 32);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text(inv.invoiceNumber || "", metaValueX, billToY, { align: "right" });
  doc.text(formatDateForDisplay(inv.invoiceDate), metaValueX, billToY + 16, {
    align: "right",
  });
  doc.text(inv.currency, metaValueX, billToY + 32, { align: "right" });

  y = Math.max(billY, billToY + 48) + 16;

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
      cellPadding: { top: 10, right: 12, bottom: 10, left: 12 },
      lineColor: border,
      lineWidth: 0.5,
      textColor: blackish,
    },
    headStyles: {
      fillColor: lightGray,
      textColor: blackish,
      fontStyle: "bold",
      halign: "center",
      lineColor: border,
      lineWidth: 0.5,
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
      fillColor: lightGray,
      textColor: blackish,
      fontStyle: "bold",
      halign: "right",
      fontSize: 12,
      lineColor: border,
      lineWidth: 0.5,
    },
    theme: "grid",
  });

  const termsY = pageHeight - margin - 60;
  if (inv.terms && inv.terms.trim()) {
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
