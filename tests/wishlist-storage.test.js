import assert from "node:assert/strict";
import test from "node:test";

import {
  STORAGE_KEY,
  createWishlistStorage,
  normalizePayload,
} from "../js/services/wishlist-storage.js";

const validIds = new Set(["product-a", "product-b"]);

function memoryStorage(initialValue = null) {
  const values = new Map();
  if (initialValue !== null) values.set(STORAGE_KEY, initialValue);
  return {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
}

test("normalizes malformed top-level values to an empty payload", () => {
  assert.deepEqual(normalizePayload(null, validIds), { version: 1, lists: [] });
  assert.deepEqual(normalizePayload({ version: 99, lists: [] }, validIds), { version: 1, lists: [] });
});

test("drops invalid lists, unknown products, and duplicate product IDs", () => {
  const payload = normalizePayload({
    version: 1,
    lists: [
      { id: "one", name: "Home", productIds: ["product-a", "product-a", "missing"] },
      { id: "two", name: "home", productIds: ["product-b"] },
      { id: "", name: "Invalid", productIds: [] },
    ],
  }, validIds);

  assert.deepEqual(payload, {
    version: 1,
    lists: [{ id: "one", name: "Home", productIds: ["product-a"] }],
  });
});

test("reports and safely recovers from malformed JSON", () => {
  const storage = createWishlistStorage(memoryStorage("not json"), validIds);
  assert.deepEqual(storage.load(), {
    payload: { version: 1, lists: [] },
    recovered: true,
  });
});

test("round-trips a valid payload through storage", () => {
  const target = memoryStorage();
  const storage = createWishlistStorage(target, validIds);
  const payload = { version: 1, lists: [{ id: "one", name: "Home", productIds: ["product-b"] }] };
  assert.equal(storage.save(payload), true);
  assert.deepEqual(storage.load(), { payload, recovered: false });
});
