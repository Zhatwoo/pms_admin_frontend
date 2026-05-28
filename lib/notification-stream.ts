import {
  isFundTransferApiNotification,
  type ApiNotification,
} from "@/lib/notifications";

type FundTransferChangeHandler = (notification?: ApiNotification) => void;

export function getNotificationStreamUrl() {
  const configured =
    process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

  if (configured) {
    return `${configured.replace(/\/$/, "")}/api/notifications/stream`;
  }

  if (typeof window === "undefined") {
    return "/api/notifications/stream";
  }

  const { protocol, hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:4000/api/notifications/stream`;
  }

  return "/api/notifications/stream";
}

export function subscribeToFundTransferNotifications(
  onChange: FundTransferChangeHandler,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  let fallbackInterval: number | null = null;

  const startFallback = () => {
    fallbackInterval ??= window.setInterval(() => onChange(), 30_000);
  };

  const stopFallback = () => {
    if (!fallbackInterval) return;
    window.clearInterval(fallbackInterval);
    fallbackInterval = null;
  };

  if (typeof EventSource === "undefined") {
    startFallback();
    return stopFallback;
  }

  const events = new EventSource(getNotificationStreamUrl(), {
    withCredentials: true,
  });

  events.addEventListener("notification.created", (event) => {
    try {
      const notification = JSON.parse((event as MessageEvent).data) as ApiNotification;
      if (isFundTransferApiNotification(notification)) {
        onChange(notification);
      }
    } catch (err) {
      console.error("Failed to parse fund transfer notification event:", err);
    }
  });

  events.onopen = stopFallback;
  events.onerror = startFallback;

  return () => {
    stopFallback();
    events.close();
  };
}
