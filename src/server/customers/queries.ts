import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface CustomerRow {
  id: string;
  phone: string;
  name: string | null;
  city: string | null;
  orderCount: number;
  createdAt: string;
}

export async function listCustomers(params: {
  query?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ customers: CustomerRow[]; total: number }> {
  const pageSize = params.pageSize ?? 20;
  const page = Math.max(1, params.page ?? 1);

  return safeQuery(async () => {
    const where: Prisma.CustomerWhereInput = params.query
      ? {
          OR: [
            { phone: { contains: params.query } },
            { name: { contains: params.query, mode: "insensitive" } },
            { city: { contains: params.query, mode: "insensitive" } },
          ],
        }
      : {};

    const [records, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: { _count: { select: { orders: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.customer.count({ where }),
    ]);

    return {
      customers: records.map((c) => ({
        id: c.id,
        phone: c.phone,
        name: c.name,
        city: c.city,
        orderCount: c._count.orders,
        createdAt: c.createdAt.toISOString(),
      })),
      total,
    };
  }, { customers: [], total: 0 });
}

export async function getCustomerById(id: string) {
  return safeQuery(
    () =>
      prisma.customer.findUnique({
        where: { id },
        include: {
          orders: {
            orderBy: { createdAt: "desc" },
            take: 10,
            select: {
              id: true,
              orderRef: true,
              orderStatus: true,
              totalMinor: true,
              createdAt: true,
            },
          },
          measurementProfiles: { orderBy: { createdAt: "desc" } },
          appointments: { orderBy: { scheduledAt: "desc" }, take: 5 },
          leads: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      }),
    null
  );
}
