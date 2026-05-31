import type { Metadata } from "next";
import { DataTable, type Column } from "@/components/admin/data-table";
import { formatDate } from "@/lib/utils";
import { listStaff, type StaffRow } from "@/server/staff/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Staff" };
export const dynamic = "force-dynamic";

const ROLE_COLOURS: Record<string, string> = {
  OWNER: "bg-jewel/10 text-jewel",
  MANAGER: "bg-royal/10 text-royal",
  SHOP_STAFF: "bg-gray-100 text-gray-700",
  TAILOR: "bg-amber-50 text-amber-700",
  CONTENT_EDITOR: "bg-purple-50 text-purple-700",
};

const COLUMNS: Column<StaffRow>[] = [
  {
    key: "name",
    header: "Staff Member",
    cell: (row) => (
      <div>
        <p className="text-xs font-medium text-gray-900">{row.name}</p>
        <p className="text-xs text-gray-400">{row.email}</p>
      </div>
    ),
  },
  {
    key: "role",
    header: "Role",
    cell: (row) => (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", ROLE_COLOURS[row.role] ?? "bg-gray-100 text-gray-600")}>
        {row.role.replace(/_/g, " ")}
      </span>
    ),
  },
  { key: "branch", header: "Branch", cell: (row) => <span className="text-xs text-gray-500">{row.branchName ?? "—"}</span> },
  {
    key: "status",
    header: "Status",
    cell: (row) => (
      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", row.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")}>
        {row.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    key: "joined",
    header: "Joined",
    cell: (row) => <time className="text-xs text-gray-400">{formatDate(row.createdAt)}</time>,
  },
];

export default async function StaffPage() {
  const staff = await listStaff();

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
        To add or deactivate staff, update the database directly or use the seed script. Staff accounts must be created server-side so passwords are hashed correctly.
      </div>
      <DataTable columns={COLUMNS} data={staff} keyField="id" emptyMessage="No staff accounts found." caption="Staff" />
    </div>
  );
}
