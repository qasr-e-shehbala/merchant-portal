# Merchant Portal — Quick Context

Fast orientation for working in this repo. Read this before re-reading source.

## What this is

The **admin / merchant portal** for Qasar-e-Shehbala — where shop staff manage the catalog, orders, tailoring, customers, etc. Deploys to **admin.qasarshehbala.pk**. Git repo: `qasar-merchant`. Separate from the public storefront (`qasar-e-shehbala` repo) but shares the **same Supabase database**.

This whole app is **behind login** (no public pages) and is `noindex`. URLs are root-level (`/orders`, `/products`) — no `/admin` prefix, because it lives on its own subdomain.

## Stack

Next.js (App Router, RSC) · TypeScript · Tailwind v4 · Prisma · Supabase Postgres.
Auth: JWT session (`jose`) + bcrypt, in `src/server/auth/`. Edge middleware (`src/middleware.ts`) protects everything except `/login`.

## Where things are

```
src/app/
  login/page.tsx          sign-in (outside the panel layout)
  (panel)/                authenticated area — shared sidebar+header layout
    page.tsx              dashboard (KPIs, recent orders, pending payments, active jobs)
    products/             list, new, [id]/edit (CRUD + image upload + fabric links + variants)
    categories/           list, new, [id]/edit (CRUD)
    fabrics/              list, new, [id]/edit (CRUD)
    orders/               list + [id] detail (status, payments, tailoring stage advance)
    tailoring/            jobs board with bilingual stage-advance buttons
    customers/ leads/ appointments/ measurements/ inventory/ analytics/ staff/  (manage/view)
    blog/                 informational (blog content is managed in the storefront repo)
  api/upload/route.ts     presigned Cloudflare R2 upload URL (image uploads)
  layout.tsx              root (fonts, noindex metadata)
src/server/               DATA LAYER — admin queries + ALL mutations + auth
  auth/                   session.ts (jose), actions.ts (login/logout), current-user.ts (requireStaff, RBAC)
  catalog/                admin-queries, mutations, category-*, fabric-*, product-mutations-extended
  orders/                 queries (lists, dashboard) + mutations (advanceTailoringStage, verifyPayment)
  customers/ appointments/ inventory/ measurements/ staff/ analytics/  queries
  db/client.ts, db/safe-query.ts
src/components/admin/      DataTable, forms, status badges, sidebar, header, uploaders, etc.
src/components/ui/         button, badge
src/lib/                  constants, utils, seo
```

## Conventions (must follow)

- **Money** = integer paisa (`BigInt`, `*Minor`). Never floats. `formatPKR` to display.
- **Mutations** are server actions in `src/server/**/mutations.ts` — validate with Zod, `revalidatePath` after writes.
- **State machine**: tailoring stages only advance through legal transitions (`advanceTailoringStage`). Payment verify recomputes `paymentStatus`.
- **RBAC**: `requireStaff()` in `(panel)/layout.tsx` gates the area; `hasAtLeastRole` for finer checks.
- Reads wrapped in `safeQuery` so pages render even if DB is briefly down.
- Self-documenting code, minimal comments. Commit messages: plain human English, **no AI/bot attribution**.
- Run `npm run build` before claiming done.

## Env (`.env.local`, git-ignored)

`DATABASE_URL` (pooled 6543), `DIRECT_URL` (5432) — SAME Supabase DB as storefront. `AUTH_SECRET` (JWT signing). `CLOUDFLARE_R2_*` + `NEXT_PUBLIC_CF_IMAGES_URL` for image uploads (optional until set).

## Deploy

Push to `main` → Vercel project `qasar-merchant`. Build runs `prisma generate` first. Set the same DB env vars + `AUTH_SECRET` in Vercel. Dev runs on port 3001 (`npm run dev`) so it can run alongside the storefront (3000).

## Shared-with-storefront (keep in sync by hand)

`prisma/schema.prisma`, `src/server/db/*`, `src/lib/utils.ts`, `src/types/`. The storefront repo owns the canonical schema — mirror schema changes here, then `prisma generate`.

## Known follow-ups

- Blog is MDX-in-git in the storefront; a DB-backed CMS here is a later phase.
- `prisma generate` must run on deploy (handled by build script + postinstall).
