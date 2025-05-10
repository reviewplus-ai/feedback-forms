-- AlterTable
ALTER TABLE "Company" ADD COLUMN "whatsappEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "whatsappNumber" TEXT,
ADD COLUMN "whatsappApiKey" TEXT,
ADD COLUMN "whatsappTemplate" TEXT; 