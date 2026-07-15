import assert from "node:assert/strict";
import test from "node:test";

import { products } from "../js/data/products.js";
import { filterProducts, getProductCategories } from "../js/services/catalog-filter.js";

test("derives a stable alphabetical category list from the catalog", () => {
  assert.deepEqual(getProductCategories(products), [
    "Decor",
    "Home",
    "Lighting",
    "Scent",
    "Stationery",
    "Tableware",
    "Textiles",
    "Wellbeing",
  ]);
});

test("searches product names, descriptions, and categories case-insensitively", () => {
  assert.deepEqual(filterProducts(products, { query: "WOVEN" }).map(({ id }) => id), ["linen-throw-sand"]);
  assert.deepEqual(filterProducts(products, { query: "warm cedarwood" }).map(({ id }) => id), ["cedar-fig-candle"]);
  assert.deepEqual(filterProducts(products, { query: "stationery" }).map(({ id }) => id), ["botanical-notebook"]);
});

test("combines search and category filters using AND semantics", () => {
  assert.deepEqual(filterProducts(products, { query: "glass", category: "Decor" }).map(({ id }) => id), ["olive-glass-vase"]);
  assert.deepEqual(filterProducts(products, { query: "glass", category: "Tableware" }), []);
});

test("empty filters return the complete catalog", () => {
  assert.equal(filterProducts(products, { query: "   ", category: "" }).length, products.length);
});
