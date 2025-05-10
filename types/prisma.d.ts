import { PrismaClient } from '@prisma/client';

declare module '@prisma/client' {
  interface PrismaClient {
    telegramUser: {
      findUnique: (args: any) => Promise<any>;
      create: (args: any) => Promise<any>;
      update: (args: any) => Promise<any>;
      upsert: (args: any) => Promise<any>;
    };
  }
} 