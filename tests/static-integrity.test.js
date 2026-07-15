import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { products } from "../js/data/products.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("catalog contains exactly eight complete products with stable unique IDs", () => {
  assert.equal(products.length, 8);
  assert.equal(new Set(products.map((product) => product.id)).size, 8);
  for (const product of products) {
    assert.ok(product.id && product.name && product.category && product.description && product.image);
    assert.equal(typeof product.price, "number");
    assert.ok(product.price > 0);
  }
});

test("every product visual is a local readable file", async () => {
  await Promise.all(products.map((product) => {
    assert.equal(product.image.startsWith("assets/images/"), true);
    return access(path.join(root, product.image));
  }));
});

test("HTML references the required local styles and application entry point", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  for (const asset of ["css/base.css", "css/components.css", "css/responsive.css", "js/app.js"]) {
    assert.match(html, new RegExp(asset.replaceAll("/", "\\/")));
  }
  assert.match(html, /<meta name="viewport"/);
  assert.match(html, /<main id="main-content"/);
});

test("HTML exposes WishFlow branding and accessible catalog filters", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  assert.match(html, /<title>WishFlow<\/title>/);
  assert.match(html, /id="product-search"/);
  assert.match(html, /id="category-filter"/);
  assert.match(html, /id="catalog-empty"/);
});

test("HTML includes the accessible product detail dialog shell", async () => {
  const html = await readFile(path.join(root, "index.html"), "utf8");
  assert.match(html, /<dialog[^>]+id="product-detail-dialog"/);
  assert.match(html, /aria-labelledby="product-detail-title"/);
  assert.match(html, /data-close-product/);
});
