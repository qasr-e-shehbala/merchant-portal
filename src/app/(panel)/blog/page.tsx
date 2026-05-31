import type { Metadata } from "next";
import { FileText } from "lucide-react";

export const metadata: Metadata = { title: "Blog & Content" };

export default function BlogInfoPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-terracotta-pale">
          <FileText className="h-6 w-6 text-terracotta" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">Blog is managed in the storefront</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Articles are version-controlled as MDX files in the storefront repository
          (<code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">content/blog/</code>).
          To publish or edit a post, update the storefront repo and redeploy.
        </p>
        <p className="mt-4 text-xs text-gray-400">
          A database-backed CMS for non-technical editors is planned for a later phase.
        </p>
      </div>
    </div>
  );
}
