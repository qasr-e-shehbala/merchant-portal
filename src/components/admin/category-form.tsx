"use client";

import { useActionState } from "react";
import type { CategoryFormState } from "@/server/catalog/category-mutations";

interface CategoryFormProps {
  action: (prev: CategoryFormState, formData: FormData) => Promise<CategoryFormState>;
  parentOptions: { id: string; name: string; slug: string }[];
  defaultValues?: {
    name?: string;
    parentId?: string;
    metaTitle?: string;
    metaDescription?: string;
    introCopy?: string;
  };
  submitLabel?: string;
}

const initialState: CategoryFormState = {};

export function CategoryForm({ action, parentOptions, defaultValues = {}, submitLabel = "Create Category" }: CategoryFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {state.error && !state.fieldErrors && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">Category Details</h3>

        <Field label="Name" id="cat-name" error={state.fieldErrors?.name?.[0]} required>
          <input
            id="cat-name"
            name="name"
            type="text"
            defaultValue={defaultValues.name}
            placeholder="e.g. Sherwani"
            required
            className={ic(!!state.fieldErrors?.name)}
          />
          <p className="mt-1 text-xs text-gray-400">Slug is auto-generated from the name.</p>
        </Field>

        <Field label="Parent Category" id="cat-parent" error={undefined}>
          <select
            id="cat-parent"
            name="parentSlug"
            defaultValue=""
            className={ic(false)}
          >
            <option value="">No parent (top level)</option>
            {parentOptions.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </Field>

        <Field label="Intro Copy" id="cat-intro" error={undefined}>
          <textarea
            id="cat-intro"
            name="introCopy"
            rows={3}
            defaultValue={defaultValues.introCopy}
            placeholder="150-300 word intro shown at the top of the collection page. Helps with SEO."
            className={ic(false)}
          />
        </Field>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">SEO (optional)</h3>

        <Field label="SEO Title (max 70 chars)" id="cat-meta-title" error={undefined}>
          <input id="cat-meta-title" name="metaTitle" type="text" maxLength={70}
            defaultValue={defaultValues.metaTitle} className={ic(false)} />
        </Field>

        <Field label="SEO Description (max 160 chars)" id="cat-meta-desc" error={undefined}>
          <textarea id="cat-meta-desc" name="metaDescription" maxLength={160} rows={2}
            defaultValue={defaultValues.metaDescription} className={ic(false)} />
        </Field>
      </section>

      <div className="flex items-center justify-end gap-3">
        <a href="/categories" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
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
