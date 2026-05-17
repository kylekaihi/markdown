const STORAGE_KEY = "quiet-edge-local-visits";
const VISITOR_ID_KEY = "quiet-edge-visitor-id";

export function formatClock(date = new Date()) {
  const datePart = new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(date);

  const timePart = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);

  return `${datePart} ${timePart}`;
}

export function createLocalVisitCounter(storage = globalThis.localStorage) {
  return () => {
    const current = Number.parseInt(storage?.getItem(STORAGE_KEY) || "0", 10);
    const next = Number.isFinite(current) ? current + 1 : 1;
    storage?.setItem(STORAGE_KEY, String(next));
    return next;
  };
}

export function getVisitorId({
  storage = globalThis.localStorage,
  randomId = () => globalThis.crypto?.randomUUID?.() || String(Date.now()),
} = {}) {
  const existing = storage?.getItem(VISITOR_ID_KEY);
  if (existing) return existing;

  const visitorId = randomId();
  storage?.setItem(VISITOR_ID_KEY, visitorId);
  return visitorId;
}

export async function getVisitCount({
  fetcher = globalThis.fetch,
  visitorId = getVisitorId(),
  localCounter = createLocalVisitCounter(),
} = {}) {
  try {
    const response = await fetcher("/api/visit", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "X-Visitor-Id": visitorId,
      },
    });
    if (!response?.ok) {
      throw new Error("Visit API unavailable");
    }

    const payload = await response.json();
    if (!Number.isFinite(payload?.count)) {
      throw new Error("Visit API returned an invalid count");
    }

    return { count: payload.count, source: "api" };
  } catch {
    return { count: localCounter(), source: "local" };
  }
}

export async function renderSiteStats({
  clockElement,
  visitorElement,
  now = () => new Date(),
  fetcher = globalThis.fetch,
  localCounter = createLocalVisitCounter(),
  intervalMs = 1000,
} = {}) {
  const updateClock = () => {
    const currentTime = now();
    if (clockElement) {
      clockElement.textContent = formatClock(currentTime);
      clockElement.setAttribute?.("datetime", currentTime.toISOString());
    }
  };

  updateClock();
  if (intervalMs > 0) {
    globalThis.setInterval(updateClock, intervalMs);
  }

  if (!visitorElement) return;

  const { count, source } = await getVisitCount({ fetcher, localCounter });
  visitorElement.textContent = `${count.toLocaleString("zh-CN")} 位访问者`;
  visitorElement.dataset.source = source;
}

export function startSiteStats() {
  return renderSiteStats({
    clockElement: document.querySelector("[data-current-time]"),
    visitorElement: document.querySelector("[data-visitor-count]"),
  });
}

if (typeof document !== "undefined") {
  startSiteStats();
}
