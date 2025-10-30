-- CreateTable
CREATE TABLE "districts" (
    "id" TEXT NOT NULL,
    "district_code" TEXT NOT NULL,
    "district_name" TEXT NOT NULL,
    "state_code" TEXT NOT NULL,
    "state_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "district_records" (
    "id" TEXT NOT NULL,
    "district_id" TEXT NOT NULL,
    "fin_year" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "approved_labour_budget" BIGINT,
    "avg_wage_rate" DOUBLE PRECISION,
    "avg_days_employment" INTEGER,
    "total_households_worked" BIGINT,
    "total_individuals_worked" BIGINT,
    "total_active_job_cards" BIGINT,
    "total_active_workers" BIGINT,
    "total_job_cards_issued" BIGINT,
    "total_workers" BIGINT,
    "hhs_completed_100_days" BIGINT,
    "sc_persondays" BIGINT,
    "sc_workers" BIGINT,
    "st_persondays" BIGINT,
    "st_workers" BIGINT,
    "women_persondays" BIGINT,
    "differently_abled_worked" BIGINT,
    "total_works_completed" BIGINT,
    "total_works_ongoing" BIGINT,
    "total_works_takenup" BIGINT,
    "gps_with_nil_exp" BIGINT,
    "total_expenditure" DOUBLE PRECISION,
    "wages" DOUBLE PRECISION,
    "material_wages" DOUBLE PRECISION,
    "admin_expenditure" DOUBLE PRECISION,
    "persondays_central_liability" BIGINT,
    "percent_category_b_works" INTEGER,
    "percent_agri_expenditure" DOUBLE PRECISION,
    "percent_nrm_expenditure" DOUBLE PRECISION,
    "percent_payments_15_days" DOUBLE PRECISION,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "district_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_sync_logs" (
    "id" TEXT NOT NULL,
    "sync_type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "records_added" INTEGER NOT NULL DEFAULT 0,
    "records_updated" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "api_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "districts_district_code_key" ON "districts"("district_code");

-- CreateIndex
CREATE INDEX "districts_state_code_idx" ON "districts"("state_code");

-- CreateIndex
CREATE INDEX "districts_district_code_idx" ON "districts"("district_code");

-- CreateIndex
CREATE INDEX "district_records_fin_year_idx" ON "district_records"("fin_year");

-- CreateIndex
CREATE INDEX "district_records_month_idx" ON "district_records"("month");

-- CreateIndex
CREATE UNIQUE INDEX "district_records_district_id_fin_year_month_key" ON "district_records"("district_id", "fin_year", "month");

-- AddForeignKey
ALTER TABLE "district_records" ADD CONSTRAINT "district_records_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
