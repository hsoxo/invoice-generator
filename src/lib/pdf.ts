import jsPDF from "jspdf";
import type { Invoice } from "./types";
import type { TemplateContext } from "./pdfTemplates/shared";
import { renderMinimal } from "./pdfTemplates/minimal";
import { renderModern } from "./pdfTemplates/modern";
import { renderClassic } from "./pdfTemplates/classic";

const renderers = {
  minimal: renderMinimal,
  modern: renderModern,
  classic: renderClassic,
};

export function generatePdf(inv: Invoice) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const ctx: TemplateContext = {
    doc,
    inv,
    pageWidth: doc.internal.pageSize.getWidth(),
    pageHeight: doc.internal.pageSize.getHeight(),
    margin: 56,
  };
  const render = renderers[inv.template] ?? renderMinimal;
  render(ctx);

  const filename = `invoice-${inv.invoiceNumber || inv.id.slice(0, 8)}-${
    inv.template
  }.pdf`;
  doc.save(filename);
}
