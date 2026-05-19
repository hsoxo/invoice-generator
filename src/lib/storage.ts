import type { Invoice } from "./types";

const KEY = "invoice-generator:history:v1";

export function loadHistory(): Invoice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Invoice[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: Invoice[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
}

export function upsertInvoice(inv: Invoice): Invoice[] {
  const list = loadHistory();
  const idx = list.findIndex((i) => i.id === inv.id);
  const next = { ...inv, createdAt: Date.now() };
  if (idx >= 0) list[idx] = next;
  else list.unshift(next);
  saveHistory(list);
  return list;
}

export function deleteInvoice(id: string): Invoice[] {
  const list = loadHistory().filter((i) => i.id !== id);
  saveHistory(list);
  return list;
}
