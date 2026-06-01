/*
  Warnings:

  - You are about to drop the column `routine_id` on the `Routine_Exercise` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[routine_day_id,exercise_id]` on the table `Routine_Exercise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `title` to the `Routine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `routine_day_id` to the `Routine_Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Routine_Exercise" DROP CONSTRAINT "Routine_Exercise_routine_id_fkey";

-- DropIndex
DROP INDEX "Routine_Exercise_routine_id_exercise_id_key";

-- AlterTable
ALTER TABLE "Routine" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3),
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Routine_Exercise" DROP COLUMN "routine_id",
ADD COLUMN     "routine_day_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Training_Log" ADD COLUMN     "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "Routine_Day" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Routine_Day_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Routine_Exercise_routine_day_id_exercise_id_key" ON "Routine_Exercise"("routine_day_id", "exercise_id");

-- AddForeignKey
ALTER TABLE "Routine_Day" ADD CONSTRAINT "Routine_Day_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine_Exercise" ADD CONSTRAINT "Routine_Exercise_routine_day_id_fkey" FOREIGN KEY ("routine_day_id") REFERENCES "Routine_Day"("id") ON DELETE CASCADE ON UPDATE CASCADE;
