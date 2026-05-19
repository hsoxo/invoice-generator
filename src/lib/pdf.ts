import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "./types";
import { computeSubtotal, formatAmount, currencySymbol } from "./totals";

const splitFromBlock = (text: string) => {
  const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const [first = "", ...rest] = lines;
  return { first, rest };
};

export function generatePdf(inv: Invoice) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 56;
  const rightX = pageWidth - margin;

  const blackish: [number, number, number] = [17, 24, 39];
  const gray: [number, number, number] = [55, 65, 81];
  const lightGray: [number, number, number] = [243, 244, 246];
  const border: [number, number, number] = [229, 231, 235];

  let y = margin + 30;

  // Header: From (left) / INVOICE (right)
  const fromBlock = splitFromBlock(inv.from);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...blackish);
  doc.text(fromBlock.first || " ", margin, y);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("INVOICE", rightX, y, { align: "right" });

  y += 22;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  fromBlock.rest.forEach((line) => {
    doc.text(line, margin, y);
    y += 14;
  });

  // Spacing before Bill To block
  y += 40;

  // Bill To section
  const billToY = y;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...blackish);
  doc.text("Bill To", margin, billToY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  const billLines = (inv.billTo || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let billY = billToY + 16;
  billLines.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, (pageWidth - margin * 2) / 2 - 20);
    wrapped.forEach((w: string) => {
      doc.text(w, margin, billY);
      billY += 14;
    });
  });

  // Invoice meta on the right (same row as Bill To label)
  const metaLabelX = rightX - 120;
  const metaValueX = rightX;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...blackish);
  doc.text("Invoice #", metaLabelX, billToY);
  doc.text("Invoice Date", metaLabelX, billToY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...gray);
  doc.text(inv.invoiceNumber || "", metaValueX, billToY, { align: "right" });
  doc.text(inv.invoiceDate || "", metaValueX, billToY + 16, { align: "right" });

  y = Math.max(billY, billToY + 32) + 16;

  // Items table
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
    foot: [["TOTAL", `${symbol}${formatAmount(computeSubtotal(inv))}`]],
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

  // Terms & Conditions at bottom of page
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

  const filename = `invoice-${inv.invoiceNumber || inv.id.slice(0, 8)}.pdf`;
  doc.save(filename);
}
