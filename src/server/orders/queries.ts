import type { OrderStatus, PaymentStatus, Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface OrderRow {
  id: string;
  orderRef: string;
  customerName: string;
  customerPhone: string;
  totalMinor: string;
  orderStatus: string;
  paymentStatus: string;
  fulfillmentType: string;
  channel: string;
  createdAt: string;
}

interface ListOrdersParams {
  status?: string;
  paymentStatus?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

function toOrderRow(record: Prisma.OrderGetPayload<{ include: { customer: true } }>): OrderRow {
  return {
    id: record.id,
    orderRef: record.orderRef,
    customerName: record.customer.name ?? "Unknown",
    customerPhone: record.customer.phone,
    totalMinor: record.totalMinor.toString(),
    orderStatus: record.orderStatus,
    paymentStatus: record.paymentStatus,
    fulfillmentType: record.fulfillmentType,
    channel: record.channel,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function listOrders(params: ListOrdersParams = {}): Promise<{ orders: OrderRow[]; total: number }> {
  const pageSize = params.pageSize ?? 20;
  const page = Math.max(1, params.page ?? 1);

  return safeQuery(
    async () => {
      const where: Prisma.OrderWhereInput = {
        ...(params.status ? { orderStatus: params.status as OrderStatus } : {}),
        ...(params.paymentStatus ? { paymentStatus: params.paymentStatus as PaymentStatus } : {}),
        ...(params.query
          ? {
              OR: [
                { orderRef: { contains: params.query, mode: "insensitive" } },
                { customer: { name: { contains: params.query, mode: "insensitive" } } },
                { customer: { phone: { contains: params.query } } },
              ],
            }
          : {}),
      };

      const [records, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: { customer: true },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        prisma.order.count({ where }),
      ]);

      return { orders: records.map(toOrderRow), total };
    },
    { orders: [], total: 0 }
  );
}

export async function getOrderById(id: string) {
  return safeQuery(
    () =>
      prisma.order.findUnique({
        where: { id },
        include: {
          customer: true,
          payments: { orderBy: { createdAt: "desc" } },
          items: { include: { product: true, tailoringJob: true } },
          events: { orderBy: { createdAt: "desc" }, include: { actor: true } },
        },
      }),
    null
  );
}

export async function getRecentOrders(limit = 8): Promise<OrderRow[]> {
  return safeQuery(async () => {
    const records = await prisma.order.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return records.map(toOrderRow);
  }, []);
}

export interface PendingPaymentRow {
  id: string;
  orderId: string;
  orderRef: string;
  amountMinor: string;
  method: string;
  senderName: string | null;
}

export async function getPendingPayments(): Promise<PendingPaymentRow[]> {
  return safeQuery(async () => {
    const records = await prisma.payment.findMany({
      where: { status: "PENDING" },
      include: { order: true },
      orderBy: { createdAt: "asc" },
      take: 10,
    });
    return records.map((payment) => ({
      id: payment.id,
      orderId: payment.orderId,
      orderRef: payment.order.orderRef,
      amountMinor: payment.amountMinor.toString(),
      method: payment.method,
      senderName: payment.senderName,
    }));
  }, []);
}

export interface ActiveJobRow {
  id: string;
  orderRef: string;
  productName: string;
  stage: string;
  promisedReadyDate: string | null;
  isOverdue: boolean;
}

export async function getActiveTailoringJobs(limit = 8): Promise<ActiveJobRow[]> {
  return safeQuery(async () => {
    const records = await prisma.tailoringJob.findMany({
      where: { stage: { notIn: ["DELIVERED", "CANCELLED"] } },
      include: { orderItem: { include: { order: true } } },
      orderBy: { promisedReadyDate: "asc" },
      take: limit,
    });
    const now = Date.now();
    return records.map((job) => ({
      id: job.id,
      orderRef: job.orderItem.order.orderRef,
      productName: job.orderItem.productName,
      stage: job.stage,
      promisedReadyDate: job.promisedReadyDate?.toISOString() ?? null,
      isOverdue: job.promisedReadyDate ? job.promisedReadyDate.getTime() < now : false,
    }));
  }, []);
}

export interface TailoringJobRow {
  id: string;
  orderRef: string;
  customerName: string;
  productName: string;
  stage: string;
  assignedTailor: string | null;
  promisedReadyDate: string | null;
  isRemote: boolean;
  reworkCount: number;
}

export async function listTailoringJobs(stage?: string): Promise<TailoringJobRow[]> {
  return safeQuery(async () => {
    const records = await prisma.tailoringJob.findMany({
      where: stage ? { stage: stage as never } : { stage: { notIn: ["DELIVERED", "CANCELLED"] } },
      include: {
        assignedTailor: true,
        orderItem: { include: { order: { include: { customer: true } } } },
      },
      orderBy: { promisedReadyDate: "asc" },
    });
    return records.map((job) => ({
      id: job.id,
      orderRef: job.orderItem.order.orderRef,
      customerName: job.orderItem.order.customer.name ?? "Unknown",
      productName: job.orderItem.productName,
      stage: job.stage,
      assignedTailor: job.assignedTailor?.name ?? null,
      promisedReadyDate: job.promisedReadyDate?.toISOString() ?? null,
      isRemote: job.isRemote,
      reworkCount: job.reworkCount,
    }));
  }, []);
}

export interface DashboardStats {
  newLeadsToday: number;
  openOrders: number;
  pendingVerifications: number;
  activeJobs: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return safeQuery(
    async () => {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      const [newLeadsToday, openOrders, pendingVerifications, activeJobs] = await Promise.all([
        prisma.lead.count({ where: { createdAt: { gte: startOfToday } } }),
        prisma.order.count({ where: { orderStatus: { in: ["CONFIRMED", "IN_PROGRESS", "READY"] } } }),
        prisma.payment.count({ where: { status: "PENDING" } }),
        prisma.tailoringJob.count({ where: { stage: { notIn: ["DELIVERED", "CANCELLED"] } } }),
      ]);

      return { newLeadsToday, openOrders, pendingVerifications, activeJobs };
    },
    { newLeadsToday: 0, openOrders: 0, pendingVerifications: 0, activeJobs: 0 }
  );
}

export interface RevenueStats {
  collectedTodayMinor: string;
  collectedMonthMinor: string;
  orderValueMonthMinor: string;
  ordersThisMonth: number;
  walkInsThisMonth: number;
  onlineThisMonth: number;
}

/** Verified cash + transfers actually collected, plus order value booked this month. */
export async function getRevenueStats(): Promise<RevenueStats> {
  const empty: RevenueStats = {
    collectedTodayMinor: "0",
    collectedMonthMinor: "0",
    orderValueMonthMinor: "0",
    ordersThisMonth: 0,
    walkInsThisMonth: 0,
    onlineThisMonth: 0,
  };

  return safeQuery(async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);

    const [collectedToday, collectedMonth, orderValueMonth, ordersThisMonth, walkInsThisMonth] =
      await Promise.all([
        prisma.payment.aggregate({
          _sum: { amountMinor: true },
          where: { status: "VERIFIED", collectedAt: { gte: startOfToday } },
        }),
        prisma.payment.aggregate({
          _sum: { amountMinor: true },
          where: { status: "VERIFIED", collectedAt: { gte: startOfMonth } },
        }),
        prisma.order.aggregate({
          _sum: { totalMinor: true },
          where: { createdAt: { gte: startOfMonth }, orderStatus: { not: "CANCELLED" } },
        }),
        prisma.order.count({
          where: { createdAt: { gte: startOfMonth }, orderStatus: { not: "CANCELLED" } },
        }),
        prisma.order.count({
          where: {
            createdAt: { gte: startOfMonth },
            orderStatus: { not: "CANCELLED" },
            channel: "IN_STORE",
          },
        }),
      ]);

    return {
      collectedTodayMinor: (collectedToday._sum.amountMinor ?? 0n).toString(),
      collectedMonthMinor: (collectedMonth._sum.amountMinor ?? 0n).toString(),
      orderValueMonthMinor: (orderValueMonth._sum.totalMinor ?? 0n).toString(),
      ordersThisMonth,
      walkInsThisMonth,
      onlineThisMonth: ordersThisMonth - walkInsThisMonth,
    };
  }, empty);
}
