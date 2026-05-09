export async function emitRealtimeToUser(userId, eventName, payload) {
  const realtimeUrl =
    process.env.REALTIME_INTERNAL_URL || process.env.NEXT_PUBLIC_SOCKET_URL;
  const secret = process.env.REALTIME_INTERNAL_SECRET;

  if (!realtimeUrl || !secret || !userId || !eventName) {
    return;
  }

  try {
    await fetch(`${realtimeUrl.replace(/\/$/, "")}/internal/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": secret,
      },
      body: JSON.stringify({ userId, eventName, payload }),
    });
  } catch {
    // Realtime notifications are best-effort; API mutations should still succeed.
  }
}
