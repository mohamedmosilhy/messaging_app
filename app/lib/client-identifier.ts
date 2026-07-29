import "server-only";

export function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const firstForwardedAddress = forwardedFor?.split(",")[0]?.trim();

  return (
    firstForwardedAddress ||
    request.headers.get("x-real-ip") ||
    "unknown-client"
  );
}
