import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface AppointmentRow {
  id: string;
  customerName: string | null;
  customerPhone: string;
  type: string;
  status: string;
  scheduledAt: string;
  staffName: string | null;
  notes: string | null;
}

export async function listAppointments(params: {
  status?: string;
  upcoming?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{ appointments: AppointmentRow[]; total: number }> {
  const pageSize = params.pageSize ?? 20;
  const page = Math.max(1, params.page ?? 1);

  return safeQuery(async () => {
    const where: Prisma.AppointmentWhereInput = {
      ...(params.status ? { status: params.status as never } : {}),
      ...(params.upcoming ? { scheduledAt: { gte: new Date() } } : {}),
    };

    const [records, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          customer: { select: { name: true, phone: true } },
          staff: { select: { name: true } },
        },
        orderBy: { scheduledAt: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.appointment.count({ where }),
    ]);

    return {
      appointments: records.map((a) => ({
        id: a.id,
        customerName: a.customer.name,
        customerPhone: a.customer.phone,
        type: a.type,
        status: a.status,
        scheduledAt: a.scheduledAt.toISOString(),
        staffName: a.staff?.name ?? null,
        notes: a.notes,
      })),
      total,
    };
  }, { appointments: [], total: 0 });
}
