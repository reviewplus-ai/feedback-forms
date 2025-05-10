-- CreateTable
CREATE TABLE "telegram_users" (
    "id" TEXT NOT NULL,
    "telegram_user_id" TEXT NOT NULL,
    "chat_id" TEXT NOT NULL,
    "username" TEXT,
    "is_subscribed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "telegram_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "telegram_users_telegram_user_id_key" ON "telegram_users"("telegram_user_id"); 