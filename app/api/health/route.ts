import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/app/lib/prisma";
import { routeErrorResponse } from "@/app/lib/route-response";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return routeErrorResponse(error, request, "health.database_unavailable");
  }
}
