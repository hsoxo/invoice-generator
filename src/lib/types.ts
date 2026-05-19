export type LineItem = {
  id: string;
  description: string;
  amount: number;
};

export type Invoice = {
  id: string;
  createdAt: number;
  docType: "INVOICE";
  invoiceNumber: string;
  invoiceDate: string;
  from: string;
  billTo: string;
  items: LineItem[];
  currency: string;
  terms: string;
};

const todayDDMMYYYY = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
};

export const emptyInvoice = (): Invoice => ({
  id: crypto.randomUUID(),
  createdAt: Date.now(),
  docType: "INVOICE",
  invoiceNumber: "100",
  invoiceDate: todayDDMMYYYY(),
  from: "",
  billTo: "",
  items: [{ id: crypto.randomUUID(), description: "", amount: 0 }],
  currency: "USD",
  terms: "Payment is due within 15 days",
});
