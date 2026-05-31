"use client";

import { useActionState } from "react";
import type { FabricFormState } from "@/server/catalog/fabric-mutations";

interface FabricFormProps {
  action: (prev: FabricFormState, formData: FormData) => Promise<FabricFormState>;
  defaultValues?: {
    code?: string;
    name?: string;
    composition?: string;
    color?: string;
    costPerMeterRupees?: number;
    supplierNote?: string;
  };
  submitLabel?: string;
  editMode?: boolean;
}

const initialState: FabricFormState = {};

export function FabricForm({ action, defaultValues = {}, submitLabel = "Create Fabric", editMode }: FabricFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && !state.fieldErrors && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">Fabric Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Code" id="fab-code" error={state.fieldErrors?.code?.[0]} required>
            <input
              id="fab-code"
              name="code"
              type="text"
              defaultValue={defaultValues.code}
              placeholder="VEL-GRN"
              readOnly={editMode}
              className={ic(!!state.fieldErrors?.code)}
            />
            <p className="mt-1 text-xs text-gray-400">Unique code. Cannot change after creation.</p>
          </Field>

          <Field label="Name" id="fab-name" error={state.fieldErrors?.name?.[0]} required>
            <input id="fab-name" name="name" type="text" defaultValue={defaultValues.name}
              placeholder="Bottle Green Velvet" required className={ic(!!state.fieldErrors?.name)} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Composition" id="fab-comp" error={undefined}>
            <input id="fab-comp" name="composition" type="text" defaultValue={defaultValues.composition}
              placeholder="Cotton velvet" className={ic(false)} />
          </Field>
          <Field label="Colour" id="fab-color" error={undefined}>
            <input id="fab-color" name="color" type="text" defaultValue={defaultValues.color}
              placeholder="Bottle Green" className={ic(false)} />
          </Field>
        </div>

        <Field label="Cost per Metre (PKR)" id="fab-cost" error={undefined}>
          <input id="fab-cost" name="costPerMeterRupees" type="number" min={0} step={50}
            defaultValue={defaultValues.costPerMeterRupees} placeholder="0"
            className={ic(false)} />
        </Field>

        <Field label="Supplier Note" id="fab-note" error={undefined}>
          <textarea id="fab-note" name="supplierNote" rows={2} defaultValue={defaultValues.supplierNote}
            placeholder="Where to source, supplier contact, notes…" className={ic(false)} />
        </Field>
      </section>

      <div className="flex items-center justify-end gap-3">
        <a href="/fabrics" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </a>
        <button type="submit" disabled={pending}
          className="rounded-lg bg-charcoal px-5 py-2 text-sm font-semibold text-white hover:bg-charcoal-soft disabled:opacity-60 transition-all">
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
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
