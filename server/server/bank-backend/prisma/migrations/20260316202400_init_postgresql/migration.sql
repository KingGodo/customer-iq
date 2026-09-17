-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "BankStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "BankUserRole" AS ENUM ('ADMIN', 'MANAGER');

-- CreateTable
CREATE TABLE "banks" (
    "id" SERIAL NOT NULL,
    "bank_name" TEXT NOT NULL,
    "nationality" TEXT,
    "license_number" TEXT,
    "branch_code" TEXT,
    "api_access_key" TEXT NOT NULL,
    "status" "BankStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bank_users" (
    "id" SERIAL NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "BankUserRole" NOT NULL DEFAULT 'MANAGER',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ref_card_types" (
    "id" SERIAL NOT NULL,
    "card_name" TEXT NOT NULL,
    "annual_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ref_card_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ref_bank_products" (
    "id" SERIAL NOT NULL,
    "product_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ref_bank_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_profiles" (
    "id" SERIAL NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "customer_uid" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" TEXT,
    "age" INTEGER,
    "geography" TEXT,
    "credit_score" INTEGER,
    "tenure_years" INTEGER NOT NULL DEFAULT 0,
    "is_active_member" INTEGER NOT NULL DEFAULT 1,
    "has_cr_card" INTEGER NOT NULL DEFAULT 0,
    "card_type_id" INTEGER,
    "joined_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_transactions" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "category" TEXT,
    "description" TEXT,
    "transaction_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_product_enrollments" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "enrolled_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_product_enrollments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_loyalty" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "points_earned" INTEGER NOT NULL DEFAULT 0,
    "satisfaction_score" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_loyalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retention_plans" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "bank_investment" TEXT NOT NULL DEFAULT '$0.00',
    "actionable_steps" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "retention_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_rules" (
    "id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "min_risk_score" DECIMAL(5,4) NOT NULL,
    "max_risk_score" DECIMAL(5,4) NOT NULL,
    "min_value_score" INTEGER NOT NULL,
    "max_value_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "allocation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "value_scoring_rules" (
    "id" SERIAL NOT NULL,
    "balance_normalization_factor" DECIMAL(14,2) NOT NULL DEFAULT 100000,
    "balance_max_points" INTEGER NOT NULL DEFAULT 40,
    "salary_normalization_factor" DECIMAL(14,2) NOT NULL DEFAULT 100000,
    "salary_max_points" INTEGER NOT NULL DEFAULT 30,
    "active_member_bonus" INTEGER NOT NULL DEFAULT 15,
    "diamond_card_bonus" INTEGER NOT NULL DEFAULT 15,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "value_scoring_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "churn_assessments" (
    "id" SERIAL NOT NULL,
    "customer_id" INTEGER NOT NULL,
    "ai_risk_score" DOUBLE PRECISION NOT NULL,
    "value_score" INTEGER NOT NULL,
    "advised_plan_id" INTEGER,
    "assessment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "churn_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_performance_logs" (
    "id" SERIAL NOT NULL,
    "bank_id" INTEGER NOT NULL,
    "total_customers_scanned" INTEGER NOT NULL,
    "high_risk_detected" INTEGER NOT NULL,
    "avg_confidence_score" DOUBLE PRECISION NOT NULL,
    "execution_time_ms" INTEGER NOT NULL,
    "run_timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_performance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "banks_api_access_key_key" ON "banks"("api_access_key");

-- CreateIndex
CREATE UNIQUE INDEX "bank_users_email_key" ON "bank_users"("email");

-- CreateIndex
CREATE INDEX "bank_users_bank_id_idx" ON "bank_users"("bank_id");

-- CreateIndex
CREATE INDEX "customer_profiles_bank_id_idx" ON "customer_profiles"("bank_id");

-- CreateIndex
CREATE INDEX "customer_profiles_is_active_member_idx" ON "customer_profiles"("is_active_member");

-- CreateIndex
CREATE UNIQUE INDEX "customer_profiles_bank_id_customer_uid_key" ON "customer_profiles"("bank_id", "customer_uid");

-- CreateIndex
CREATE INDEX "customer_transactions_customer_id_idx" ON "customer_transactions"("customer_id");

-- CreateIndex
CREATE INDEX "customer_transactions_category_transaction_type_idx" ON "customer_transactions"("category", "transaction_type");

-- CreateIndex
CREATE INDEX "customer_product_enrollments_customer_id_status_idx" ON "customer_product_enrollments"("customer_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "customer_loyalty_customer_id_key" ON "customer_loyalty"("customer_id");

-- CreateIndex
CREATE INDEX "allocation_rules_plan_id_idx" ON "allocation_rules"("plan_id");

-- CreateIndex
CREATE INDEX "churn_assessments_customer_id_idx" ON "churn_assessments"("customer_id");

-- CreateIndex
CREATE INDEX "churn_assessments_assessment_date_idx" ON "churn_assessments"("assessment_date");

-- CreateIndex
CREATE INDEX "ai_performance_logs_bank_id_run_timestamp_idx" ON "ai_performance_logs"("bank_id", "run_timestamp");

-- AddForeignKey
ALTER TABLE "bank_users" ADD CONSTRAINT "bank_users_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_profiles" ADD CONSTRAINT "customer_profiles_card_type_id_fkey" FOREIGN KEY ("card_type_id") REFERENCES "ref_card_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_transactions" ADD CONSTRAINT "customer_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_product_enrollments" ADD CONSTRAINT "customer_product_enrollments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_product_enrollments" ADD CONSTRAINT "customer_product_enrollments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "ref_bank_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_loyalty" ADD CONSTRAINT "customer_loyalty_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "allocation_rules" ADD CONSTRAINT "allocation_rules_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "retention_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "churn_assessments" ADD CONSTRAINT "churn_assessments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "churn_assessments" ADD CONSTRAINT "churn_assessments_advised_plan_id_fkey" FOREIGN KEY ("advised_plan_id") REFERENCES "retention_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_performance_logs" ADD CONSTRAINT "ai_performance_logs_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

