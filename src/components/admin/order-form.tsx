"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { formatPKR } from "@/lib/utils";
import type { OrderFormState } from "@/server/orders/order-actions";

interface OrderFormProps {
  action: (prev: OrderFormState, formData: FormData) => Promise<OrderFormState>;
}

interface LineItem {
  productName: string;
  qty: number;
  unitPriceRupees: string;
  fabricNote: string;
}

const PAYMENT_METHODS = ["CASH", "RAAST", "BANK_TRANSFER", "JAZZCASH", "EASYPAISA", "CARD"];

const emptyItem: LineItem = { productName: "", qty: 1, unitPriceRupees: "", fabricNote: "" };
const initialState: OrderFormState = {};

export function OrderForm({ action }: OrderFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [items, setItems] = useState<LineItem[]>([{ ...emptyItem }]);
  const [discount, setDiscount] = useState("");
  const [deposit, setDeposit] = useState("");
  const [fullPayment, setFullPayment] = useState(false);

  const update = (index: number, patch: Partial<LineItem>) =>
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const addRow = () => setItems((rows) => [...rows, { ...emptyItem }]);
  const removeRow = (index: number) =>
    setItems((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== index) : rows));

  const { subtotal, total } = useMemo(() => {
    const sub = items.reduce(
      (sum, item) => sum + (Number(item.unitPriceRupees) || 0) * (Number(item.qty) || 0),
      0
    );
    const disc = Number(discount) || 0;
    return { subtotal: sub, total: Math.max(0, sub - disc) };
  }, [items, discount]);

  const paid = fullPayment ? total : Math.min(Number(deposit) || 0, total);
  const balance = Math.max(0, total - paid);

  // Items serialized to the action as JSON (dynamic row count).
  const itemsPayload = JSON.stringify(
    items
      .filter((item) => item.productName.trim())
      .map((item) => ({
        productName: item.productName.trim(),
        qty: Number(item.qty) || 1,
        unitPriceRupees: Number(item.unitPriceRupees) || 0,
        fabricNote: item.fabricNote.trim(),
      }))
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="items" value={itemsPayload} />

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {state.error}
        </p>
      )}

      {/* Customer */}
      <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        <h3 className="text-sm font-semibold text-gray-900">Customer</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Name" id="o-name" error={state.fieldErrors?.name?.[0]} required>
            <input id="o-name" name="name" type="text" placeholder="Customer name" required className={ic(!!state.fieldErrors?.name)} />
          </Field>
          <Field label="Phone / WhatsApp" id="o-phone" error={state.fieldErrors?.phone?.[0]} required>
            <input id="o-phone" name="phone" type="tel" placeholder="03xx xxxxxxx" required className={ic(!!state.fieldErrors?.phone)} />
          </Field>
          <Field label="City" id="o-city" error={undefined}>
            <input id="o-city" name="city" type="text" placeholder="Rawalpindi" className={ic(false)} />
          </Field>
        </div>
      </section>

      {/* Items */}
      <section className="space-y-4 rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Items</h3>
          <button type="button" onClick={addRow} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-gray-300">
            <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add item
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2.5">
              <div className="col-span-12 sm:col-span-5">
                <input
                  value={item.productName}
                  onChange={(e) => update(index, { productName: e.target.value })}
                  placeholder="e.g. Black velvet sherwani"
                  className={ic(false)}
                />
              </div>
              <div className="col-span-3 sm:col-span-1">
                <input
                  type="number"
                  min={1}
                  value={item.qty}
                  onChange={(e) => update(index, { qty: Number(e.target.value) })}
                  aria-label="Quantity"
                  className={ic(false)}
                />
              </div>
              <div className="col-span-9 sm:col-span-3">
                <input
                  type="number"
                  min={0}
                  value={item.unitPriceRupees}
                  onChange={(e) => update(index, { unitPriceRupees: e.target.value })}
                  placeholder="Unit price (PKR)"
                  className={ic(false)}
                />
              </div>
              <div className="col-span-10 sm:col-span-2">
                <input
                  value={item.fabricNote}
                  onChange={(e) => update(index, { fabricNote: e.target.value })}
                  placeholder="Fabric / note"
                  className={ic(false)}
                />
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  disabled={items.length === 1}
                  aria-label="Remove item"
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Payment + totals */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-semibold text-gray-900">Payment</h3>

          <Field label="Discount (PKR)" id="o-discount" error={undefined}>
            <input id="o-discount" name="discountRupees" type="number" min={0} value={discount}
              onChange={(e) => setDiscount(e.target.value)} placeholder="0" className={ic(false)} />
          </Field>

          <label className="flex items-center gap-2.5 text-sm text-gray-700">
            <input type="checkbox" name="fullPayment" checked={fullPayment}
              onChange={(e) => setFullPayment(e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            Paid in full now
          </label>

          {!fullPayment && (
            <Field label="Amount collected now (PKR)" id="o-deposit" error={undefined}>
              <input id="o-deposit" name="depositRupees" type="number" min={0} value={deposit}
                onChange={(e) => setDeposit(e.target.value)} placeholder="e.g. 50000" className={ic(false)} />
            </Field>
          )}

          <Field label="Payment method" id="o-method" error={undefined}>
            <select id="o-method" name="paymentMethod" defaultValue="CASH" className={ic(false)}>
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>

          <Field label="Notes" id="o-notes" error={undefined}>
            <textarea id="o-notes" name="notes" rows={2} placeholder="Occasion, promised date, special instructions…" className={ic(false)} />
          </Field>
        </div>

        <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="text-sm font-semibold text-gray-900">Summary</h3>
          <Row label="Subtotal" value={formatPKR(subtotal * 100)} />
          <Row label="Discount" value={`− ${formatPKR((Number(discount) || 0) * 100)}`} />
          <div className="border-t border-gray-200 pt-3">
            <Row label="Total" value={formatPKR(total * 100)} bold />
          </div>
          <Row label="Collected now" value={formatPKR(paid * 100)} />
          <Row label="Balance due" value={formatPKR(balance * 100)} bold />
        </div>
      </section>

      <div className="flex items-center justify-end gap-3">
        <a href="/orders" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </a>
        <button type="submit" disabled={pending}
          className="rounded-lg bg-[#0f0f0f] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2d2d2d] disabled:opacity-60 transition-all">
          {pending ? "Saving…" : "Create Order"}
        </button>
      </div>
    </form>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={bold ? "font-semibold text-gray-900 tabular-nums" : "text-gray-700 tabular-nums"}>{value}</span>
    </div>
  );
}

function Field({ label, id, error, required, children }: {
  label: string; id: string; error?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}

const ic = (hasError: boolean) => [
  "w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400",
  "focus:outline-none focus:ring-2 focus:ring-charcoal focus:border-transparent transition-colors",
  hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300",
].join(" ");
