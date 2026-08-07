import { NextRequest, NextResponse } from "next/server";

import { RealtimeQueryValidation } from "@/app/features/realtime/schemas/realtime.schema";
import {
  deleteExpiredRealtimeEvents,
  getRealtimeEventsForUser,
} from "@/app/features/realtime/services/realtime-events.service";
import { ValidationError } from "@/app/lib/errors/ValidationError";
import { enforceRateLimit, rateLimits } from "@/app/lib/rate-limit";
import { routeErrorResponse } from "@/app/lib/route-response";
import { formatZodErrors } from "@/app/utils/formatZodErrors";
import { requireCurrentUserId } from "@/app/utils/requireCurrentUserId";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const STREAM_DURATION_MS = 25_000;
const POLL_INTERVAL_MS = 750;
const MAX_INITIAL_LOOKBACK_MS = 5 * 60_000;

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timeout = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout);
        resolve();
      },
      { once: true },
    );
  });
}

export async function GET(request: NextRequest) {
  try {
    const currentUserId = await requireCurrentUserId();
    await enforceRateLimit({
      scope: "realtime-connection",
      identifier: currentUserId,
      ...rateLimits.realtimeConnection,
    });

    const parsedQuery = RealtimeQueryValidation.safeParse({
      since: request.nextUrl.searchParams.get("since") ?? undefined,
      lastEventId: request.nextUrl.searchParams.get("lastEventId") ?? undefined,
    });

    if (!parsedQuery.success) {
      throw new ValidationError(formatZodErrors(parsedQuery.error));
    }

    const earliestAllowed = Date.now() - MAX_INITIAL_LOOKBACK_MS;
    const requestedSince = parsedQuery.data.since
      ? new Date(parsedQuery.data.since)
      : new Date();
    const initialSince = new Date(
      Math.max(earliestAllowed, requestedSince.getTime()),
    );
    const headerEventId =
      request.headers.get("last-event-id") ?? parsedQuery.data.lastEventId;
    const encoder = new TextEncoder();

    await deleteExpiredRealtimeEvents();

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        let lastEventId = headerEventId;
        let since: Date | undefined = initialSince;
        const startedAt = Date.now();

        const send = (value: string) => {
          controller.enqueue(encoder.encode(value));
        };

        void (async () => {
          try {
            send("retry: 1000\n\n");

            while (
              !request.signal.aborted &&
              Date.now() - startedAt < STREAM_DURATION_MS
            ) {
              const events = await getRealtimeEventsForUser({
                userId: currentUserId,
                lastEventId,
                since,
              });

              for (const event of events) {
                send(
                  `id: ${event.eventId}\nevent: relay\ndata: ${JSON.stringify(event)}\n\n`,
                );
                lastEventId = event.eventId;
                since = undefined;
              }

              if (events.length === 0) {
                send(`: keepalive ${Date.now()}\n\n`);
              }

              await wait(POLL_INTERVAL_MS, request.signal);
            }
          } catch {
            // Closing makes EventSource reconnect and HTTP refetch recovers state.
          } finally {
            try {
              controller.close();
            } catch {
              // The browser may already have cancelled the stream.
            }
          }
        })();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return routeErrorResponse(error, request, "realtime.connection_failed");
  }
}
