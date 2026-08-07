-- Stable per-participant read markers support multi-client convergence.
ALTER TABLE "Participation"
ADD COLUMN "lastReadMessageId" TEXT,
ADD COLUMN "lastReadAt" TIMESTAMP(3);

ALTER TABLE "Participation"
ADD CONSTRAINT "Participation_lastReadMessageId_fkey"
FOREIGN KEY ("lastReadMessageId") REFERENCES "Message"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Durable events provide serverless-safe fan-out and reconnect recovery.
CREATE TABLE "RealtimeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "conversationId" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealtimeEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RealtimeEventDelivery" (
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RealtimeEventDelivery_pkey" PRIMARY KEY ("eventId", "userId")
);

CREATE INDEX "RealtimeEvent_conversationId_occurredAt_id_idx"
ON "RealtimeEvent"("conversationId", "occurredAt", "id");

CREATE INDEX "RealtimeEvent_expiresAt_idx"
ON "RealtimeEvent"("expiresAt");

CREATE INDEX "RealtimeEventDelivery_userId_eventId_idx"
ON "RealtimeEventDelivery"("userId", "eventId");

ALTER TABLE "RealtimeEvent"
ADD CONSTRAINT "RealtimeEvent_conversationId_fkey"
FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RealtimeEventDelivery"
ADD CONSTRAINT "RealtimeEventDelivery_eventId_fkey"
FOREIGN KEY ("eventId") REFERENCES "RealtimeEvent"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RealtimeEventDelivery"
ADD CONSTRAINT "RealtimeEventDelivery_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
