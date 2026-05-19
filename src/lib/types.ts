export type LineItem = {
  id: string;
  description: string;
  amount: number;
};

export type TemplateId = "minimal" | "modern" | "classic";

export const TEMPLATES: { id: TemplateId; name: string; description: string }[] =
  [
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean black & white layout, matches the basic invoice style.",
    },
    {
      id: "modern",
      name: "Modern",
      description: "Blue accent band header with a bold table.",
    },
    {
      id: "classic",
      name: "Classic",
      description: "Centered title with framed sections, traditional look.",
    },
  ];

export type Invoice = {
  id: string;
  createdAt: number;
  docType: "INVOICE";
  template: TemplateId;
  invoiceNumber: string;
  invoiceDate: string;
  from: string;
  billTo: string;
  items: LineItem[];
  currency: string;
  terms: string;
};

const todayISO = () => new Date().toISOString().slice(0, 10);

export const emptyInvoice = (): Invoice => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  docType: "INVOICE",
  template: "minimal",
  invoiceNumber: "100",
  invoiceDate: todayISO(),
  from: "",
  billTo: "",
  items: [{ id: crypto.randomUUID(), description: "", amount: 0 }],
  currency: "USD",
  terms: "Payment is due within 15 days",
});
