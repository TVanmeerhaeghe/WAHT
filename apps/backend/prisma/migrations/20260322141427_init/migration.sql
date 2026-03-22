-- CreateEnum
CREATE TYPE "Region" AS ENUM ('eu', 'us', 'kr', 'tw');

-- CreateEnum
CREATE TYPE "AlertCondition" AS ENUM ('BELOW', 'ABOVE');

-- CreateEnum
CREATE TYPE "ItemQuality" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY');

-- CreateTable
CREATE TABLE "Alert" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "realmId" INTEGER,
    "targetPrice" BIGINT NOT NULL,
    "condition" "AlertCondition" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "triggeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionSnapshot" (
    "id" SERIAL NOT NULL,
    "itemId" INTEGER NOT NULL,
    "realmId" INTEGER NOT NULL,
    "minPrice" BIGINT NOT NULL,
    "maxPrice" BIGINT NOT NULL,
    "avgPrice" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RawAuction" (
    "id" BIGINT NOT NULL,
    "itemId" INTEGER NOT NULL,
    "realmId" INTEGER NOT NULL,
    "price" BIGINT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RawAuction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quality" "ItemQuality" NOT NULL,
    "iconUrl" TEXT,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Realm" (
    "id" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "region" "Region" NOT NULL,

    CONSTRAINT "Realm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "battletag" TEXT NOT NULL,
    "region" "Region" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_userId_idx" ON "Alert"("userId");

-- CreateIndex
CREATE INDEX "Alert_itemId_active_idx" ON "Alert"("itemId", "active");

-- CreateIndex
CREATE INDEX "AuctionSnapshot_itemId_realmId_capturedAt_idx" ON "AuctionSnapshot"("itemId", "realmId", "capturedAt");

-- CreateIndex
CREATE INDEX "AuctionSnapshot_capturedAt_idx" ON "AuctionSnapshot"("capturedAt");

-- CreateIndex
CREATE INDEX "RawAuction_itemId_realmId_idx" ON "RawAuction"("itemId", "realmId");

-- CreateIndex
CREATE INDEX "RawAuction_capturedAt_idx" ON "RawAuction"("capturedAt");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");

-- CreateIndex
CREATE INDEX "Item_quality_idx" ON "Item"("quality");

-- CreateIndex
CREATE UNIQUE INDEX "Realm_slug_key" ON "Realm"("slug");

-- CreateIndex
CREATE INDEX "Realm_region_idx" ON "Realm"("region");

-- CreateIndex
CREATE INDEX "Realm_slug_idx" ON "Realm"("slug");

-- CreateIndex
CREATE INDEX "User_battletag_idx" ON "User"("battletag");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_realmId_fkey" FOREIGN KEY ("realmId") REFERENCES "Realm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionSnapshot" ADD CONSTRAINT "AuctionSnapshot_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionSnapshot" ADD CONSTRAINT "AuctionSnapshot_realmId_fkey" FOREIGN KEY ("realmId") REFERENCES "Realm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawAuction" ADD CONSTRAINT "RawAuction_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RawAuction" ADD CONSTRAINT "RawAuction_realmId_fkey" FOREIGN KEY ("realmId") REFERENCES "Realm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
