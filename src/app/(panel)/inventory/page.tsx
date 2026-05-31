import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/data-table";
import { listStockLevels, listFabrics, type StockRow, type FabricRow } from "@/server/inventory/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

const STOCK_COLUMNS: Column<StockRow>[] = [
  {
    key: "product",
    header: "Product",
    cell: (row) => (
      <div>
        <p className="text-xs font-medium text-gray-900">{row.productName}</p>
        <p className="text-xs text-gray-400 font-mono">{row.sku}</p>
      </div>
    ),
  },
  {
    key: "attrs",
    header: "Attributes",
    cell: (row) => (
      <span className="text-xs text-gray-500">
        {Object.entries(row.attributes).map(([k, v]) => `${k}: ${v}`).join(", ") || "—"}
      </span>
    ),
  },
  {
    key: "onHand",
    header: "On Hand",
    cell: (row) => <span className="text-xs font-medium tabular-nums">{row.onHand}</span>,
  },
  {
    key: "reserved",
    header: "Reserved",
    cell: (row) => <span className="text-xs text-gray-500 tabular-nums">{row.reserved}</span>,
  },
  {
    key: "available",
    header: "Available",
    cell: (row) => (
      <span className={cn("text-xs font-semibold tabular-nums", row.isLow ? "text-red-600" : "text-emerald-700")}>
        {row.available}
        {row.isLow && <span className="ml-1 text-[10px] font-normal text-red-500">Low</span>}
      </span>
    ),
  },
];

const FABRIC_COLUMNS: Column<FabricRow>[] = [
  {
    key: "fabric",
    header: "Fabric",
    cell: (row) => (
      <div>
        <p className="text-xs font-medium text-gray-900">{row.name}</p>
        <p className="text-xs text-gray-400 font-mono">{row.code}</p>
      </div>
    ),
  },
  { key: "composition", header: "Composition", cell: (row) => <span className="text-xs text-gray-500">{row.composition ?? "—"}</span> },
  { key: "color", header: "Colour", cell: (row) => <span className="text-xs text-gray-500">{row.color ?? "—"}</span> },
  {
    key: "stock",
    header: "On Hand (m)",
    cell: (row) => (
      <span className="text-xs font-medium tabular-nums">
        {row.onHandMeters ?? <span className="text-gray-300">Not tracked</span>}
      </span>
    ),
  },
];

export default async function InventoryPage() {
  const [stockLevels, fabrics] = await Promise.all([listStockLevels(), listFabrics()]);

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Ready-to-Wear Stock</h2>
        <DataTable
          columns={STOCK_COLUMNS}
          data={stockLevels}
          keyField="variantId"
          emptyMessage="No stock-tracked variants. Made-to-order items have no stock."
          caption="Stock levels"
        />
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Fabrics</h2>
        <DataTable columns={FABRIC_COLUMNS} data={fabrics} keyField="id" emptyMessage="No fabrics added yet." caption="Fabrics" />
      </section>
    </div>
  );
}
