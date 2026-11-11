-- Safe, additive forward-compatible migration for Dukkanak dropshipping and return management
-- Preserves all existing tables, records, users, and orders without data loss

-- 1. Add dropshipping supplier fields
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Supplier" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- 2. Add dropshipping status values to OrderStatus enum if not present
DO $$
BEGIN
    ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'SENT_TO_SUPPLIER';
    ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'SUPPLIER_PROCESSING';
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Add dropshipping order tracking fields
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "supplierOrderId" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "supplierNotes" TEXT;

-- 4. Add wholesale costPrice snapshot to OrderItem
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "costPriceSnapshot" DECIMAL(10,2);

-- 5. Create Return enums
DO $$
BEGIN
    CREATE TYPE "ReturnStatus" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED', 'ITEM_RECEIVED', 'REFUNDED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$
BEGIN
    CREATE TYPE "ReturnReason" AS ENUM ('DAMAGED_PRODUCT', 'WRONG_ITEM', 'DEFECTIVE', 'NOT_AS_DESCRIBED', 'CHANGED_MIND', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Create ReturnRequest table
CREATE TABLE IF NOT EXISTS "ReturnRequest" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "ReturnReason" NOT NULL DEFAULT 'DEFECTIVE',
    "description" TEXT,
    "status" "ReturnStatus" NOT NULL DEFAULT 'REQUESTED',
    "refundAmount" DECIMAL(10,2),
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReturnRequest_pkey" PRIMARY KEY ("id")
);

-- 7. Add foreign keys and indexes safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ReturnRequest_orderId_fkey'
    ) THEN
        ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_orderId_fkey"
            FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ReturnRequest_userId_fkey'
    ) THEN
        ALTER TABLE "ReturnRequest" ADD CONSTRAINT "ReturnRequest_userId_fkey"
            FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "ReturnRequest_orderId_idx" ON "ReturnRequest"("orderId");
CREATE INDEX IF NOT EXISTS "ReturnRequest_userId_idx" ON "ReturnRequest"("userId");
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "Product_supplierId_idx" ON "Product"("supplierId");
