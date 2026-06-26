-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('Low', 'Medium', 'High');

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" SERIAL NOT NULL,
    "customer" TEXT NOT NULL,
    "project" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "estimated_value" DOUBLE PRECISION NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analysis_results" (
    "id" TEXT NOT NULL,
    "quote_id" INTEGER NOT NULL,
    "risk" "RiskLevel" NOT NULL,
    "confidence" INTEGER NOT NULL,
    "missing_items" TEXT[],
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analysis_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "analysis_results_quote_id_key" ON "analysis_results"("quote_id");

-- AddForeignKey
ALTER TABLE "analysis_results" ADD CONSTRAINT "analysis_results_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
