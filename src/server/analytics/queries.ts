import { prisma } from "@/server/db/client";
import { safeQuery } from "@/server/db/safe-query";

export interface AnalyticsSummary {
  totalLeads: number;
  totalWhatsAppClicks: number;
  totalPageViews: number;
  leadsToday: number;
  topEventTypes: { eventType: string; count: number }[];
  leadsBySource: { source: string; count: number }[];
  recentLeads: {
    id: string;
    ref: string;
    phone: string;
    source: string;
    city: string | null;
    createdAt: string;
  }[];
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  return safeQuery(async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalLeads,
      leadsToday,
      whatsAppClicks,
      pageViews,
      eventGroups,
      sourceGroups,
      recentLeads,
    ] = await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.analyticsEvent.count({ where: { eventType: "whatsapp_click" } }),
      prisma.analyticsEvent.count({ where: { eventType: "view_product" } }),
      prisma.analyticsEvent.groupBy({
        by: ["eventType"],
        _count: { id: true },
        where: { createdAt: { gte: sevenDaysAgo } },
        orderBy: { _count: { id: "desc" } },
        take: 6,
      }),
      prisma.lead.groupBy({
        by: ["source"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, ref: true, phone: true, source: true, city: true, createdAt: true },
      }),
    ]);

    return {
      totalLeads,
      totalWhatsAppClicks: whatsAppClicks,
      totalPageViews: pageViews,
      leadsToday,
      topEventTypes: eventGroups.map((e) => ({ eventType: e.eventType, count: e._count.id })),
      leadsBySource: sourceGroups.map((s) => ({ source: s.source, count: s._count.id })),
      recentLeads: recentLeads.map((l) => ({
        id: l.id,
        ref: l.ref,
        phone: l.phone,
        source: l.source,
        city: l.city,
        createdAt: l.createdAt.toISOString(),
      })),
    };
  }, {
    totalLeads: 0,
    totalWhatsAppClicks: 0,
    totalPageViews: 0,
    leadsToday: 0,
    topEventTypes: [],
    leadsBySource: [],
    recentLeads: [],
  });
}
