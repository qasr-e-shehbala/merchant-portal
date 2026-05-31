import { PrismaClient } from "@prisma/client";

const SOFT_DELETE_MODELS = new Set([
  "Product",
  "ProductVariant",
  "Category",
  "Customer",
  "Staff",
  "Fabric",
  "MeasurementProfile",
]);

const READ_OPERATIONS = new Set(["findMany", "findFirst", "count", "aggregate"]);

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }).$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (
            SOFT_DELETE_MODELS.has(model) &&
            READ_OPERATIONS.has(operation) &&
            args &&
            typeof args === "object"
          ) {
            const typedArgs = args as { where?: Record<string, unknown> };
            typedArgs.where = { deletedAt: null, ...typedArgs.where };
          }
          return query(args);
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedPrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
