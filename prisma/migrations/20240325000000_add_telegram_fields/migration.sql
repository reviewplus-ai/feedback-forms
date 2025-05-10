-- AlterTable
ALTER TABLE "Company" DROP COLUMN IF EXISTS "whatsappEnabled",
DROP COLUMN IF EXISTS "whatsappNumber",
DROP COLUMN IF EXISTS "whatsappApiKey",
DROP COLUMN IF EXISTS "whatsappTemplate",
ADD COLUMN "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "telegramBotToken" TEXT,
ADD COLUMN "telegramChatId" TEXT,
ADD COLUMN "telegramTemplate" TEXT; 