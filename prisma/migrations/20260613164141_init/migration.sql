/*
  Warnings:

  - You are about to drop the column `contact` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `shopName` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `totalValue` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SupplierQuote` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `orderNo` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "SimpleDeliveryStatus" AS ENUM ('PENDING', 'COMPLETED');

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_orderId_fkey";

-- DropForeignKey
ALTER TABLE "SupplierQuote" DROP CONSTRAINT "SupplierQuote_productId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "contact",
DROP COLUMN "district",
DROP COLUMN "shopName",
DROP COLUMN "status",
DROP COLUMN "totalValue",
ADD COLUMN     "confirmationStatus" "ConfirmationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "deliveryStatus" "SimpleDeliveryStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "orderNo" TEXT NOT NULL,
ADD COLUMN     "quotationStatus" "QuotationStatus" NOT NULL DEFAULT 'PENDING';

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "SupplierQuote";

-- DropEnum
DROP TYPE "ConfirmStatus";

-- DropEnum
DROP TYPE "DeliveryStatus";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "QuoteStatus";
