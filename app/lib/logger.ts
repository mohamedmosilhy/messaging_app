import "server-only";

type LogContext = Record<string, boolean | number | string | null | undefined>;

function writeLog(
  level: "error" | "info" | "warn",
  event: string,
  context: LogContext = {},
) {
  const entry = JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    ...context,
  });

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warn") {
    console.warn(entry);
    return;
  }

  console.info(entry);
}

export const logger = {
  error: (event: string, context?: LogContext) =>
    writeLog("error", event, context),
  info: (event: string, context?: LogContext) =>
    writeLog("info", event, context),
  warn: (event: string, context?: LogContext) =>
    writeLog("warn", event, context),
};
