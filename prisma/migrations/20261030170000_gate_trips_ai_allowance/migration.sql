-- CreateTable
CREATE TABLE "trips" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "preferences" JSONB NOT NULL,
    "ai_assisted" BOOLEAN NOT NULL,
    "is_synthetic" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_allowances" (
    "id" TEXT NOT NULL,
    "max_calls" INTEGER NOT NULL,
    "used_calls" INTEGER NOT NULL DEFAULT 0,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_allowances_pkey" PRIMARY KEY ("id")
);


-- Shared AI call allowance for the Week 7 gate demo (10 calls total, no reset).
INSERT INTO "ai_allowances" ("id", "max_calls") VALUES ('gate-demo', 10) ON CONFLICT ("id") DO NOTHING;
