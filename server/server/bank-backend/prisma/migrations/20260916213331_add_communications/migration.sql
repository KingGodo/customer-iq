-- CreateEnum
CREATE TYPE "CommChannel" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "CommCampaignStatus" AS ENUM ('DRAFT', 'SENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "CommMessageStatus" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'SKIPPED');

-- AlterTable
ALTER TABLE "customer_profiles" ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "retention_plans" ADD COLUMN     "email_template" TEXT,
ADD COLUMN     "sms_template" TEXT;

-- CreateTable
CREATE TABLE "communication_campaigns" (
    "id" SERIAL NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "plan_id" INTEGER,
    "name" TEXT NOT NULL,
    "channel" "CommChannel" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" "CommCampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "target_min_risk" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "failed_count" INTEGER NOT NULL DEFAULT 0,
    "created_by" INTEGER,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communication_messages" (
    "id" SERIAL NOT NULL,
    "campaign_id" INTEGER NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "channel" "CommChannel" NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" "CommMessageStatus" NOT NULL DEFAULT 'QUEUED',
    "error_message" TEXT,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "communication_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "communication_campaigns_bank_id_created_at_idx" ON "communication_campaigns"("bank_id", "created_at");

-- CreateIndex
CREATE INDEX "communication_messages_campaign_id_idx" ON "communication_messages"("campaign_id");

-- CreateIndex
CREATE INDEX "communication_messages_customer_id_idx" ON "communication_messages"("customer_id");

-- AddForeignKey
ALTER TABLE "communication_campaigns" ADD CONSTRAINT "communication_campaigns_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_campaigns" ADD CONSTRAINT "communication_campaigns_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "retention_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_messages" ADD CONSTRAINT "communication_messages_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "communication_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communication_messages" ADD CONSTRAINT "communication_messages_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
