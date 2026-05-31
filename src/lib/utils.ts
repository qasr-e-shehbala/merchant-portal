import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const PKR_FORMATTER = new Intl.NumberFormat("ur-PK", {
  style: "currency",
  currency: "PKR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

// Money is stored as integer paisa (BigInt) end-to-end; never use floats for arithmetic.
export function formatPKR(paisa: bigint | number): string {
  const rupees = typeof paisa === "bigint" ? Number(paisa) / 100 : paisa / 100;
  return PKR_FORMATTER.format(rupees);
}

export function rupeesToPaisa(rupees: number): bigint {
  return BigInt(Math.round(rupees * 100));
}

export function generateRef(prefix = "QES"): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `${prefix}-${year}-${random}`;
}

export interface WhatsAppMessageParams {
  ref: string;
  productName?: string;
  sku?: string;
  fabric?: string;
  size?: string;
  productUrl?: string;
}

export function buildWhatsAppUrl(params: WhatsAppMessageParams): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  const message = [
    "Assalam o Alaikum Qasar-e-Shehbala!",
    `Order ref: ${params.ref}`,
    params.productName ? `Product: ${params.productName}` : null,
    params.sku ? `SKU: ${params.sku}` : null,
    params.fabric ? `Fabric: ${params.fabric}` : null,
    params.size ? `Size: ${params.size}` : "Size: Custom — will share measurements",
    params.productUrl ? `Link: ${params.productUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("92")) return digits;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-PK", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(date: Date | string): string {
  return DATE_FORMATTER.format(new Date(date));
}

export function assertDefined<T>(value: T | null | undefined, label = "value"): T {
  if (value == null) throw new Error(`Expected ${label} to be defined`);
  return value;
}
