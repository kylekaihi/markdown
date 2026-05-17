const VISIT_KEY = "site:visits";

export async function onRequestPost({ request, env }) {
  if (!env?.SITE_VISITS) {
    return jsonResponse(
      { error: "SITE_VISITS KV binding is not configured" },
      503,
    );
  }

  const visitorId = sanitizeVisitorId(request?.headers.get("x-visitor-id"));
  const current = Number.parseInt((await env.SITE_VISITS.get(VISIT_KEY)) || "0", 10);
  let next = Number.isFinite(current) ? current : 0;

  if (visitorId) {
    const visitorKey = `site:visitor:${visitorId}`;
    const existingVisitor = await env.SITE_VISITS.get(visitorKey);
    if (!existingVisitor) {
      next += 1;
      await env.SITE_VISITS.put(visitorKey, "1");
      await env.SITE_VISITS.put(VISIT_KEY, String(next));
    }

    return jsonResponse({ count: next });
  }

  next += 1;
  await env.SITE_VISITS.put(VISIT_KEY, String(next));

  return jsonResponse({ count: next });
}

export function onRequestGet() {
  return jsonResponse({ error: "Use POST" }, 405);
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

function sanitizeVisitorId(visitorId) {
  if (!visitorId || visitorId.length > 120) return "";
  return visitorId.replace(/[^a-zA-Z0-9_-]/g, "");
}
