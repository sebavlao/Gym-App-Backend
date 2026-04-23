/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'Coach', 'Client');

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "qr_code" TEXT,
ADD COLUMN     "role" "Role" NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- CreateTable
CREATE TABLE "Client_Detail" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blood_type" TEXT,
    "pathologies" TEXT,
    "allergies" TEXT,
    "observations" TEXT,
    "emergency_contact" TEXT,

    CONSTRAINT "Client_Detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach_Detail" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blood_type" TEXT,
    "pathologies" TEXT,
    "allergies" TEXT,
    "observations" TEXT,
    "emergency_contact" TEXT,

    CONSTRAINT "Coach_Detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gym" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Gym_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "gym_id" TEXT NOT NULL,
    "coach_id" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Physical_Profile" (
    "id" TEXT NOT NULL,
    "client_detail_id" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "body_fat_percentage" DOUBLE PRECISION,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Physical_Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscle_group" TEXT NOT NULL,
    "media_url" TEXT,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "coach_id" TEXT NOT NULL,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine_Exercise" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,

    CONSTRAINT "Routine_Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Training_Log" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "routine_exercise_id" TEXT NOT NULL,
    "weight_used" DOUBLE PRECISION NOT NULL,
    "actual_reps" INTEGER NOT NULL,
    "calories_burned" DOUBLE PRECISION,

    CONSTRAINT "Training_Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Meal_Plan" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,

    CONSTRAINT "Meal_Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat_Message" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Chat_Message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Client_Detail_user_id_key" ON "Client_Detail"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coach_Detail_user_id_key" ON "Coach_Detail"("user_id");

-- AddForeignKey
ALTER TABLE "Client_Detail" ADD CONSTRAINT "Client_Detail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coach_Detail" ADD CONSTRAINT "Coach_Detail_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "Gym"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "Coach_Detail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Physical_Profile" ADD CONSTRAINT "Physical_Profile_client_detail_id_fkey" FOREIGN KEY ("client_detail_id") REFERENCES "Client_Detail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine_Exercise" ADD CONSTRAINT "Routine_Exercise_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine_Exercise" ADD CONSTRAINT "Routine_Exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training_Log" ADD CONSTRAINT "Training_Log_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Training_Log" ADD CONSTRAINT "Training_Log_routine_exercise_id_fkey" FOREIGN KEY ("routine_exercise_id") REFERENCES "Routine_Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Meal_Plan" ADD CONSTRAINT "Meal_Plan_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat_Message" ADD CONSTRAINT "Chat_Message_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat_Message" ADD CONSTRAINT "Chat_Message_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
