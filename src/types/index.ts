export interface Product {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  productType: "STOCK" | "MADE_TO_ORDER" | "BOTH";
  basePriceMinor: string; // serialized BigInt (paisa)
  isPublished: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
  romanUrduKeywords?: string | null;
  category?: Category | null;
  variants: ProductVariant[];
  images: ProductImage[];
  fabricOptions: ProductFabricOption[];
}

export interface ProductVariant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  priceOverrideMinor?: string | null; // serialized BigInt
  isStockTracked: boolean;
  stockLevels?: StockLevel[];
}

export interface ProductImage {
  id: string;
  r2Key: string;
  alt: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  parentId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  introCopy?: string | null;
  children?: Category[];
}

export interface Fabric {
  id: string;
  code: string;
  name: string;
  composition?: string | null;
  color?: string | null;
}

export interface ProductFabricOption {
  fabric: Fabric;
}

export interface StockLevel {
  branchId: string;
  onHand: number;
  reserved: number;
}

export interface Lead {
  id: string;
  ref: string;
  phone: string;
  productId?: string | null;
  sizeNote?: string | null;
  city?: string | null;
  source: LeadSource;
}

export type LeadSource =
  | "DIRECT_WHATSAPP"
  | "REFERRAL"
  | "WALK_IN"
  | "INSTAGRAM"
  | "WEB"
  | "PHONE";

export interface BlogPost {
  id: string;
  slug: string;
  type: "ARTICLE" | "LOOKBOOK";
  title: string;
  excerpt?: string | null;
  body?: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  publishedAt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageKey?: string | null;
  readingTime?: number | null;
  tags: BlogTag[];
}

export interface BlogTag {
  id: string;
  slug: string;
  name: string;
}

// ─── UI-specific types ────────────────────────────────────────────────────────

export interface FilterState {
  category?: string;
  fabric?: string;
  minPrice?: number;
  maxPrice?: number;
  productType?: "STOCK" | "MADE_TO_ORDER";
  sort?: "price_asc" | "price_desc" | "newest";
}

export interface WhatsAppCTAProps {
  productName: string;
  sku?: string;
  fabricName?: string;
  sizeName?: string;
  productUrl: string;
  productId?: string;
  variantId?: string;
  className?: string;
}

export interface BreadcrumbItem {
  name: string;
  href: string;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
