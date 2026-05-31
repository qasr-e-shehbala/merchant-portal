import type { Prisma } from "@prisma/client";
import { prisma } from "@/server/db/client";

export interface RecordEventInput {
  eventType: string;
  referenceId?: string;
  productId?: string;
  variantId?: string;
  source?: string;
  utmCampaign?: string;
  pageUrl?: string;
  payload?: Record<string, unknown>;
}

export async function recordEvent({ payload, ...input }: RecordEventInput) {
  return prisma.analyticsEvent.create({
    data: {
      ...input,
      payload: payload as Prisma.InputJsonValue | undefined,
    },
  });
}
