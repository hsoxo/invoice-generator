import type { Invoice } from "./types";

export const CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "CAD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
  { code: "CNY", symbol: "¥" },
  { code: "JPY", symbol: "¥" },
  { code: "AUD", symbol: "$" },
  { code: "HKD", symbol: "$" },
];

export function currencySymbol(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? "$";
}

export function computeSubtotal(inv: Invoice) {
  return inv.items.reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
}

export function formatAmount(amount: number) {
  return (Number(amount) || 0).toFixed(2);
}

export function formatMoney(amount: number, code: string) {
  return `${currencySymbol(code)}${formatAmount(amount)}`;
}
