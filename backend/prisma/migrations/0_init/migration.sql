-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "transaction_type" AS ENUM ('income', 'expense');

-- CreateTable
CREATE TABLE "categories" (
    "category_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "category_type" "transaction_type" NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id")
);

-- CreateTable
CREATE TABLE "category_limits" (
    "limit_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "category_limits_pkey" PRIMARY KEY ("limit_id")
);

-- CreateTable
CREATE TABLE "credit_payments" (
    "payment_id" BIGSERIAL NOT NULL,
    "credit_id" BIGINT NOT NULL,
    "transaction_id" BIGINT NOT NULL,

    CONSTRAINT "credit_payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "credits" (
    "credit_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "interest_rate" DECIMAL(5,2),
    "start_date" DATE NOT NULL,
    "end_date" DATE,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("credit_id")
);

-- CreateTable
CREATE TABLE "places" (
    "place_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "name" VARCHAR(150) NOT NULL,

    CONSTRAINT "places_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "transaction_id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "category_id" BIGINT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "comment" TEXT,
    "transaction_date" DATE NOT NULL,
    "place_id" BIGINT,
    "type" "transaction_type" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" BIGSERIAL NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_categories_id_type" ON "categories"("category_id", "category_type");

-- CreateIndex
CREATE UNIQUE INDEX "uq_categories_user_name" ON "categories"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_category_limits_category_id" ON "category_limits"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_category_limits_user_category" ON "category_limits"("user_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "credit_payments_transaction_id_key" ON "credit_payments"("transaction_id");

-- CreateIndex
CREATE INDEX "idx_credit_payments_credit_id" ON "credit_payments"("credit_id");

-- CreateIndex
CREATE INDEX "idx_credits_user_id" ON "credits"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "uq_places_user_name" ON "places"("user_id", "name");

-- CreateIndex
CREATE INDEX "idx_transaction_category_id" ON "transactions"("category_id");

-- CreateIndex
CREATE INDEX "idx_transaction_type" ON "transactions"("type");

-- CreateIndex
CREATE INDEX "idx_transaction_user_id" ON "transactions"("user_id");

-- CreateIndex
CREATE INDEX "idx_transactions_date" ON "transactions"("transaction_date");

-- CreateIndex
CREATE INDEX "idx_transactions_place_id" ON "transactions"("place_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category_limits" ADD CONSTRAINT "fk_category_limits_category" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "category_limits" ADD CONSTRAINT "fk_category_limits_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credit_payments" ADD CONSTRAINT "fk_credit_payments_credit" FOREIGN KEY ("credit_id") REFERENCES "credits"("credit_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credit_payments" ADD CONSTRAINT "fk_credit_payments_transaction" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("transaction_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "fk_credits_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "places" ADD CONSTRAINT "fk_places_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_transaction_categoty_type" FOREIGN KEY ("category_id", "type") REFERENCES "categories"("category_id", "category_type") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_transaction_place" FOREIGN KEY ("place_id") REFERENCES "places"("place_id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "fk_transaction_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION;

