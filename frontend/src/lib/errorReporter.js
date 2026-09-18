const API_URL = import.meta.env.VITE_API_URL;

// Fire-and-forget by design: error reporting must never itself throw or
// block the UI, and there's no admin session to attach a bearer token to
// when a crash happens on the public site — this endpoint is intentionally
// public (see backend/src/logs/logs.controller.ts).
export function reportError({ message, stack, level = 'error' }) {
  try {
    fetch(`${API_URL}/logs/client-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: String(message ?? 'Unknown error').slice(0, 500),
        stack: stack ? String(stack).slice(0, 2000) : undefined,
        url: window.location.href,
        userAgent: navigator.userAgent,
        level,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // never let error reporting itself throw
  }
}
