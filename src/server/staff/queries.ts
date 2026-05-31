import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface StaffRow {
  id: string;
  name: string;
  email: string;
  role: string;
  branchName: string | null;
  isActive: boolean;
  createdAt: string;
}

export async function listStaff(): Promise<StaffRow[]> {
  return safeQuery(async () => {
    const records = await prisma.staff.findMany({
      include: { branch: { select: { name: true } } },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    });
    return records.map((s) => ({
      id: s.id,
      name: s.name,
      email: s.email,
      role: s.role,
      branchName: s.branch?.name ?? null,
      isActive: s.isActive,
      createdAt: s.createdAt.toISOString(),
    }));
  }, []);
}
