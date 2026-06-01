/*
  Warnings:

  - A unique constraint covering the columns `[routine_id,exercise_id]` on the table `Routine_Exercise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `coach_id` to the `Meal_Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `end_date` to the `Meal_Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Meal_Plan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `Routine_Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repetitions` to the `Routine_Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `series` to the `Routine_Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Routine_Exercise" DROP CONSTRAINT "Routine_Exercise_routine_id_fkey";

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "gym_id" TEXT,
ADD COLUMN     "is_custom" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Meal_Plan" ADD COLUMN     "coach_id" TEXT NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Routine_Exercise" ADD COLUMN     "order" INTEGER NOT NULL,
ADD COLUMN     "repetitions" TEXT NOT NULL,
ADD COLUMN     "rest_time" INTEGER,
ADD COLUMN     "series" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Meal" (
    "id" TEXT NOT NULL,
    "meal_plan_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal_Item" (
    "id" TEXT NOT NULL,
    "meal_id" TEXT NOT NULL,
    "food_name" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fats" DOUBLE PRECISION NOT NULL,
    "alternatives" TEXT,

    CONSTRAINT "Meal_Item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Routine_Exercise_routine_id_exercise_id_key" ON "Routine_Exercise"("routine_id", "exercise_id");

-- AddForeignKey
ALTER TABLE "Routine_Exercise" ADD CONSTRAINT "Routine_Exercise_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal" ADD CONSTRAINT "Meal_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "Meal_Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal_Item" ADD CONSTRAINT "Meal_Item_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
