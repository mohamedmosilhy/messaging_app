-- Add a stable client-generated identity for idempotent message creation.
ALTER TABLE "Message" ADD COLUMN "clientId" TEXT;

-- Existing rows predate client IDs. Their server IDs are already unique and
-- provide a safe one-time backfill.
UPDATE "Message" SET "clientId" = "id";

ALTER TABLE "Message" ALTER COLUMN "clientId" SET NOT NULL;

-- One sender can safely retry the same logical message, while different
-- senders may independently generate the same client ID.
CREATE UNIQUE INDEX "Message_senderId_clientId_key"
ON "Message"("senderId", "clientId");

-- Replace the single-column history index with the actual stable cursor order.
DROP INDEX "Message_conversationId_idx";
CREATE INDEX "Message_conversationId_createdAt_id_idx"
ON "Message"("conversationId", "createdAt", "id");
