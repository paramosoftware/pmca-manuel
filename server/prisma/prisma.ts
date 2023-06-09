import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const isProduction = process.env.NODE_ENV === 'production';

export const prisma =
    globalForPrisma.prisma || new PrismaClient({
        log: isProduction ? ['error'] : ['query', 'info', 'warn', 'error'],
    });


if (!isProduction) {
    globalForPrisma.prisma = prisma
}

