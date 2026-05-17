import assert from "node:assert/strict";
import test from "node:test";
import { onRequestPost } from "./visit.js";

test("visit API increments and returns the global visitor count from KV", async () => {
  const values = new Map([["site:visits", "4"]]);
  const response = await onRequestPost({
    request: new Request("https://example.com/api/visit", {
      method: "POST",
      headers: { "x-visitor-id": "reader-1" },
    }),
    env: {
      SITE_VISITS: {
        get: async (key) => values.get(key) ?? null,
        put: async (key, value) => values.set(key, value),
      },
    },
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Content-Type"), "application/json; charset=utf-8");
  assert.deepEqual(await response.json(), { count: 5 });
  assert.equal(values.get("site:visits"), "5");
  assert.equal(values.get("site:visitor:reader-1"), "1");
});

test("visit API does not increment when the visitor was already counted", async () => {
  const values = new Map([
    ["site:visits", "5"],
    ["site:visitor:reader-1", "1"],
  ]);
  const response = await onRequestPost({
    request: new Request("https://example.com/api/visit", {
      method: "POST",
      headers: { "x-visitor-id": "reader-1" },
    }),
    env: {
      SITE_VISITS: {
        get: async (key) => values.get(key) ?? null,
        put: async (key, value) => values.set(key, value),
      },
    },
  });

  assert.deepEqual(await response.json(), { count: 5 });
  assert.equal(values.get("site:visits"), "5");
});

test("visit API reports a setup error when the KV binding is missing", async () => {
  const response = await onRequestPost({ env: {} });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: "SITE_VISITS KV binding is not configured",
  });
});
