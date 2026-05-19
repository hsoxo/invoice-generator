"use client";

import { useEffect, useMemo, useState } from "react";
import type { Invoice, LineItem } from "@/lib/types";
import { emptyInvoice } from "@/lib/types";
import {
  loadHistory,
  upsertInvoice,
  deleteInvoice,
} from "@/lib/storage";
import {
  CURRENCIES,
  computeSubtotal,
  currencySymbol,
  formatAmount,
} from "@/lib/totals";
import { generatePdf } from "@/lib/pdf";

export default function Page() {
  const [invoice, setInvoice] = useState<Invoice>(() => emptyInvoice());
  const [history, setHistory] = useState<Invoice[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHistory(loadHistory());
    setHydrated(true);
  }, []);

  const subtotal = useMemo(() => computeSubtotal(invoice), [invoice]);

  const update = <K extends keyof Invoice>(key: K, value: Invoice[K]) =>
    setInvoice((inv) => ({ ...inv, [key]: value }));

  const updateItem = (id: string, patch: Partial<LineItem>) =>
    setInvoice((inv) => ({
      ...inv,
      items: inv.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));

  const addItem = () =>
    setInvoice((inv) => ({
      ...inv,
      items: [
        ...inv.items,
        { id: crypto.randomUUID(), description: "", amount: 0 },
      ],
    }));

  const removeItem = (id: string) =>
    setInvoice((inv) => ({
      ...inv,
      items:
        inv.items.length > 1
          ? inv.items.filter((it) => it.id !== id)
          : inv.items,
    }));

  const handleSaveAndPdf = () => {
    const next = upsertInvoice(invoice);
    setHistory(next);
    generatePdf(invoice);
  };

  const handleLoad = (inv: Invoice) => setInvoice({ ...inv });
  const handleNew = () => setInvoice(emptyInvoice());
  const handleDelete = (id: string) => {
    const next = deleteInvoice(id);
    setHistory(next);
    if (invoice.id === id) setInvoice(emptyInvoice());
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Invoice Generator
          </h1>
          <p className="text-sm text-slate-500">
            Fill in the form, then save and download a PDF.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          New invoice
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
        {/* Form card */}
        <section className="rounded-2xl border border-blue-200 bg-blue-50/70 p-6 shadow-sm">
          {/* From */}
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            From
          </label>
          <textarea
            value={invoice.from}
            onChange={(e) => update("from", e.target.value)}
            placeholder={"Your business name\nAddress line 1\nAddress line 2"}
            rows={3}
            className="mb-5 w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
          />

          {/* Bill To + meta */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_220px]">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Bill To
              </label>
              <textarea
                value={invoice.billTo}
                onChange={(e) => update("billTo", e.target.value)}
                placeholder={"Customer name\nBilling address"}
                rows={4}
                className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Invoice #
                </label>
                <input
                  value={invoice.invoiceNumber}
                  onChange={(e) => update("invoiceNumber", e.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">
                  Invoice Date
                </label>
                <input
                  value={invoice.invoiceDate}
                  onChange={(e) => update("invoiceDate", e.target.value)}
                  placeholder="DD/MM/YYYY"
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>
          </div>

          <hr className="my-6 border-blue-200" />

          {/* Item header */}
          <div className="mb-2 grid grid-cols-[1fr_140px_36px] gap-3 text-sm font-semibold text-slate-700">
            <div>Description</div>
            <div>Amount</div>
            <div />
          </div>

          {/* Items */}
          <div className="space-y-2">
            {invoice.items.map((it) => (
              <div
                key={it.id}
                className="grid grid-cols-[1fr_140px_36px] gap-3"
              >
                <textarea
                  value={it.description}
                  onChange={(e) =>
                    updateItem(it.id, { description: e.target.value })
                  }
                  placeholder="Description"
                  rows={2}
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <input
                  type="number"
                  step="0.01"
                  value={it.amount === 0 ? "" : it.amount}
                  onChange={(e) =>
                    updateItem(it.id, { amount: Number(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                  className="w-full rounded-md border border-slate-300 bg-white p-2 text-right text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  aria-label="Remove item"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-40"
                  disabled={invoice.items.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-3 w-full rounded-md bg-yellow-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-yellow-300"
          >
            Add New Item
          </button>

          {/* Totals */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-slate-700">Subtotal</span>
              <span className="text-slate-800">{formatAmount(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-blue-200 pt-3">
              <div className="flex items-center gap-2 text-base font-bold text-slate-900">
                TOTAL
                <select
                  value={invoice.currency}
                  onChange={(e) => update("currency", e.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm font-medium text-blue-700"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-lg font-bold text-blue-700">
                {currencySymbol(invoice.currency)}
                {formatAmount(subtotal)}
              </span>
            </div>
          </div>

          {/* Terms */}
          <div className="mt-6">
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Terms &amp; Conditions
            </label>
            <textarea
              value={invoice.terms}
              onChange={(e) => update("terms", e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white p-3 text-sm text-slate-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <button
            type="button"
            onClick={handleSaveAndPdf}
            className="mt-6 w-full rounded-md bg-slate-800 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-900"
          >
            Save Invoice & Download PDF
          </button>
        </section>

        {/* History sidebar */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
            History
          </h2>
          {!hydrated ? (
            <p className="text-xs text-slate-400">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-xs text-slate-400">
              Saved invoices appear here.
            </p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li
                  key={h.id}
                  className={`group rounded-md border p-2 text-sm ${
                    h.id === invoice.id
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleLoad(h)}
                    className="block w-full text-left"
                  >
                    <div className="font-medium text-slate-800">
                      #{h.invoiceNumber || "—"}{" "}
                      <span className="text-slate-400">·</span>{" "}
                      {currencySymbol(h.currency)}
                      {formatAmount(computeSubtotal(h))}
                    </div>
                    <div className="truncate text-xs text-slate-500">
                      {h.billTo?.split("\n")[0] || "No customer"} ·{" "}
                      {new Date(h.createdAt).toLocaleDateString()}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(h.id)}
                    className="mt-1 text-xs text-red-500 opacity-0 group-hover:opacity-100"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  );
}
