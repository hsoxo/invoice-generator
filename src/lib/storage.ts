import type { Invoice } from "./types";

const KEY = "invoice-generator:history:v1";
const MAX_HISTORY = 20;

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

export function appendInvoice(inv: Invoice): { list: Invoice[]; saved: Invoice } {
  const list = loadHistory();
  const saved: Invoice = {
    ...inv,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
  };
  list.unshift(saved);
  const trimmed = list.slice(0, MAX_HISTORY);
  saveHistory(trimmed);
  return { list: trimmed, saved };
}

export function deleteInvoice(id: string): Invoice[] {
  const list = loadHistory().filter((i) => i.id !== id);
  saveHistory(list);
  return list;
}
