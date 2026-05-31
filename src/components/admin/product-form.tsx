"use client";

import { useActionState } from "react";
import type { ProductFormState } from "@/server/catalog/mutations";

interface ProductFormProps {
  action: (prev: ProductFormState, formData: FormData) => Promise<ProductFormState>;
  categories: { id: string; slug: string; name: string }[];
  defaultValues?: {
    name?: string;
    description?: string;
    categorySlug?: string;
    productType?: string;
    basePriceRupees?: number;
    isPublished?: boolean;
    metaTitle?: string;
    metaDescription?: string;
    romanUrduKeywords?: string;
  };
  submitLabel?: string;
}

const initialState: ProductFormState = {};

export function ProductForm({ action, categories, defaultValues = {}, submitLabel = "Save Product" }: ProductFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  function fieldError(name: string) {
    return state.fieldErrors?.[name]?.[0];
  }

  return (
    <form action={formAction} className="space-y-6">
      {state.error && !state.fieldErrors && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">{state.error}</p>
      )}

      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>

        <Field label="Product Name" error={fieldError("name")} required>
          <input
            name="name"
            type="text"
            defaultValue={defaultValues.name}
            placeholder="e.g. Black Velvet Embroidered Sherwani"
            className={ic(!!fieldError("name"))}
            required
          />
        </Field>

        <Field label="Description" error={fieldError("description")}>
          <textarea
            name="description"
            defaultValue={defaultValues.description}
            rows={4}
            placeholder="Unique 2–4 sentences describing fabric, embroidery, occasion, and fit. Required for SEO."
            className={ic(!!fieldError("description"))}
          />
          <p className="mt-1 text-xs text-gray-400">Required for SEO — every product needs unique copy.</p>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" error={fieldError("categorySlug")}>
            <select name="categorySlug" defaultValue={defaultValues.categorySlug ?? ""} className={ic(false)}>
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>{cat.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Type" error={fieldError("productType")} required>
            <select name="productType" defaultValue={defaultValues.productType ?? "MADE_TO_ORDER"} className={ic(false)}>
              <option value="MADE_TO_ORDER">Made to Order</option>
              <option value="STOCK">Ready to Wear (Stock)</option>
              <option value="BOTH">Both</option>
            </select>
          </Field>
        </div>

        <Field label="Base Price (PKR Rupees)" error={fieldError("basePriceRupees")} required>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">PKR</span>
            <input
              name="basePriceRupees"
              type="number"
              min={0}
              step={100}
              defaultValue={defaultValues.basePriceRupees}
              placeholder="0"
              className={`${ic(!!fieldError("basePriceRupees"))} pl-12`}
            />
          </div>
        </Field>

        <div className="flex items-center gap-3">
          <input
            id="isPublished"
            name="isPublished"
            type="checkbox"
            value="true"
            defaultChecked={defaultValues.isPublished ?? false}
            className="h-4 w-4 rounded border-gray-300 text-jewel focus:ring-jewel"
          />
          <label htmlFor="isPublished" className="text-sm text-gray-700">
            Published — visible on the storefront
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-6 space-y-5">
        <h3 className="text-sm font-semibold text-gray-900">SEO</h3>
        <p className="text-xs text-gray-500">Leave blank to use the product name/description as defaults.</p>

        <Field label="SEO Title (max 70 chars)" error={fieldError("metaTitle")}>
          <input
            name="metaTitle"
            type="text"
            maxLength={70}
            defaultValue={defaultValues.metaTitle}
            placeholder={`${defaultValues.name ?? "Product name"} | Qasar-e-Shehbala`}
            className={ic(!!fieldError("metaTitle"))}
          />
        </Field>

        <Field label="SEO Description (max 160 chars)" error={fieldError("metaDescription")}>
          <textarea
            name="metaDescription"
            maxLength={160}
            rows={2}
            defaultValue={defaultValues.metaDescription}
            className={ic(!!fieldError("metaDescription"))}
          />
        </Field>

        <Field label="Roman-Urdu Keywords" error={fieldError("romanUrduKeywords")}>
          <input
            name="romanUrduKeywords"
            type="text"
            defaultValue={defaultValues.romanUrduKeywords}
            placeholder="dulha ki sherwani, prince coat banwana, shaadi ka joora"
            className={ic(false)}
          />
          <p className="mt-1 text-xs text-gray-400">Comma-separated. Captures ~40% of Pakistani searchers who use Roman-Urdu.</p>
        </Field>
      </section>

      <div className="flex items-center justify-end gap-3">
        <a href="/products" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
          Cancel
        </a>
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-gradient-to-r from-royal to-jewel px-5 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-60 transition-all"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, required, children }: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}

const ic = (hasError: boolean) =>
  [
    "w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400",
    "focus:outline-none focus:ring-2 focus:ring-royal focus:border-transparent transition-colors",
    hasError ? "border-red-300 bg-red-50" : "border-gray-200 bg-white hover:border-gray-300",
  ].join(" ");
