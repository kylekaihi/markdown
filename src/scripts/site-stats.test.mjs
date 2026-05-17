import assert from "node:assert/strict";
import test from "node:test";
import {
  createLocalVisitCounter,
  getVisitorId,
  formatClock,
  getVisitCount,
  renderSiteStats,
} from "./site-stats.mjs";

test("formatClock renders a Chinese date and time", () => {
  const clock = formatClock(new Date("2026-05-17T09:08:07+09:00"));

  assert.match(clock, /2026/);
  assert.match(clock, /05/);
  assert.match(clock, /17/);
  assert.match(clock, /09:08:07/);
});

test("createLocalVisitCounter counts visits in browser storage", () => {
  const storage = new Map();
  const counter = createLocalVisitCounter({
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  });

  assert.equal(counter(), 1);
  assert.equal(counter(), 2);
});

test("getVisitorId reuses the stored visitor ID", () => {
  const storage = new Map([["quiet-edge-visitor-id", "reader-1"]]);

  assert.equal(
    getVisitorId({
      storage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value),
      },
    }),
    "reader-1",
  );
});

test("getVisitorId stores a generated visitor ID", () => {
  const storage = new Map();
  const visitorId = getVisitorId({
    storage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    },
    randomId: () => "reader-2",
  });

  assert.equal(visitorId, "reader-2");
  assert.equal(storage.get("quiet-edge-visitor-id"), "reader-2");
});

test("getVisitCount uses the site API when it returns a numeric count", async () => {
  const count = await getVisitCount({
    fetcher: async (_url, options) => {
      assert.equal(options.headers["X-Visitor-Id"], "reader-1");
      return {
      ok: true,
      json: async () => ({ count: 42 }),
      };
    },
    visitorId: "reader-1",
    localCounter: () => 3,
  });

  assert.deepEqual(count, { count: 42, source: "api" });
});

test("getVisitCount falls back to local counting when the site API is unavailable", async () => {
  const count = await getVisitCount({
    fetcher: async () => {
      throw new Error("offline");
    },
    localCounter: () => 7,
  });

  assert.deepEqual(count, { count: 7, source: "local" });
});

test("renderSiteStats writes clock and visit count into the provided elements", async () => {
  const attributes = new Map();
  const clockElement = {
    textContent: "",
    setAttribute: (name, value) => attributes.set(name, value),
  };
  const visitorElement = { textContent: "", dataset: {} };

  await renderSiteStats({
    clockElement,
    visitorElement,
    now: () => new Date("2026-05-17T09:08:07+09:00"),
    fetcher: async () => ({
      ok: true,
      json: async () => ({ count: 12 }),
    }),
    localCounter: () => 1,
    intervalMs: 0,
  });

  assert.match(clockElement.textContent, /09:08:07/);
  assert.equal(attributes.get("datetime"), "2026-05-17T00:08:07.000Z");
  assert.equal(visitorElement.textContent, "12 位访问者");
  assert.equal(visitorElement.dataset.source, "api");
});
