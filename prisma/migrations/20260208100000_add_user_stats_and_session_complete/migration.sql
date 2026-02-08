-- AlterTable
ALTER TABLE "study_sessions" ADD COLUMN "duration_actual" INTEGER,
ADD COLUMN "completed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_stats" (
    "user_id" UUID NOT NULL,
    "total_study_time" INTEGER NOT NULL DEFAULT 0,
    "total_sessions" INTEGER NOT NULL DEFAULT 0,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_session_date" DATE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "user_stats_pkey" PRIMARY KEY ("user_id")
);
