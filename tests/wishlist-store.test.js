import assert from "node:assert/strict";
import test from "node:test";

import { WishlistError, WishlistStore } from "../js/state/wishlist-store.js";

const products = [{ id: "a" }, { id: "b" }, { id: "c" }];

function createStore(initialLists = []) {
  const saves = [];
  const storage = {
    load: () => ({ payload: { version: 1, lists: initialLists }, recovered: false }),
    save: (payload) => { saves.push(payload); return true; },
  };
  return { store: new WishlistStore({ products, storage }), saves };
}

test("creates trimmed, uniquely named wishlists", () => {
  const { store } = createStore();
  const list = store.create("  New home  ");
  assert.equal(list.name, "New home");
  assert.throws(() => store.create("new HOME"), (error) => (
    error instanceof WishlistError && error.code === "DUPLICATE_NAME"
  ));
});

test("adds and removes products and rejects duplicates", () => {
  const { store } = createStore([{ id: "one", name: "Home", productIds: [] }]);
  store.add("one", "a");
  assert.deepEqual(store.getLists()[0].productIds, ["a"]);
  assert.throws(() => store.add("one", "a"), (error) => error.code === "DUPLICATE_PRODUCT");
  store.remove("one", "a");
  assert.deepEqual(store.getLists()[0].productIds, []);
});

test("merges unique products, retains destination name, and deletes source", () => {
  const { store, saves } = createStore([
    { id: "source", name: "Source", productIds: ["a", "b"] },
    { id: "destination", name: "Destination", productIds: ["b", "c"] },
  ]);

  const result = store.merge("source", "destination");
  assert.equal(result.name, "Destination");
  assert.deepEqual(result.productIds, ["b", "c", "a"]);
  assert.deepEqual(store.getLists(), [
    { id: "destination", name: "Destination", productIds: ["b", "c", "a"] },
  ]);
  assert.equal(saves.length, 1);
});

test("prevents a list from being merged into itself", () => {
  const { store } = createStore([{ id: "one", name: "Home", productIds: ["a"] }]);
  assert.throws(() => store.merge("one", "one"), (error) => (
    error instanceof WishlistError && error.code === "SAME_LIST"
  ));
});

test("does not mutate memory when persistence fails", () => {
  const storage = {
    load: () => ({ payload: { version: 1, lists: [] }, recovered: false }),
    save: () => false,
  };
  const store = new WishlistStore({ products, storage });
  assert.throws(() => store.create("Later"), (error) => error.code === "STORAGE_UNAVAILABLE");
  assert.deepEqual(store.getLists(), []);
});
