import type jsPDF from "jspdf";
import type { Invoice } from "../types";

export type TemplateContext = {
  doc: jsPDF;
  inv: Invoice;
  pageWidth: number;
  pageHeight: number;
  margin: number;
};

export const splitFromBlock = (text: string) => {
  const lines = (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
  const [first = "", ...rest] = lines;
  return { first, rest };
};

export const splitLines = (text: string) =>
  (text || "").split("\n").map((l) => l.trim()).filter(Boolean);
