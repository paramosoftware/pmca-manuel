import type {
    Prisma as _Prisma
} from '@prisma/client';

import pkg from '@prisma/client';

const {
    PrismaClient: RequiredPrismaClient,
    Prisma: RequiredPrisma
} = pkg

const Prisma: typeof _Prisma = RequiredPrisma;

export class PrismaClient extends RequiredPrismaClient {}

export namespace Prisma {
    export namespace DMMF {
        export type Field = _Prisma.DMMF.Field;
        export type dmmf = _Prisma.DMMF.Document;
    }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const isProduction = process.env.NODE_ENV === 'production';

const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        log: isProduction ? ['error'] : ['info', 'warn', 'error']
    });

if (!isProduction) {
    globalForPrisma.prisma = prisma;
}


export { prisma, Prisma };