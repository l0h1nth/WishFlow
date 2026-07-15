import assert from "node:assert/strict";
import test from "node:test";

import { products } from "../js/data/products.js";
import { productDetailTemplate, productGridTemplate } from "../js/ui/templates.js";

const product = products[0];

test("catalog cards expose product IDs and a View details button", () => {
  const html = productGridTemplate([product], []);
  assert.match(html, new RegExp(`data-product-id="${product.id}"`));
  assert.match(html, new RegExp(`data-view-product="${product.id}"`));
  assert.match(html, />View details<\/button>/);
});

test("product details include every required product field", () => {
  const html = productDetailTemplate(product, [{ id: "home", name: "Home", productIds: [] }]);
  for (const value of [product.image, product.name, product.category, product.description]) {
    assert.match(html, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(html, /\$34/);
  assert.match(html, new RegExp(`data-add-product="${product.id}"`));
  assert.match(html, /<option value="home">Home<\/option>/);
});

test("product detail wishlist controls are safely disabled when no lists exist", () => {
  const html = productDetailTemplate(product, []);
  assert.match(html, /<select[^>]+disabled>/);
  assert.match(html, /<button[^>]+type="submit" disabled>/);
  assert.match(html, /Create a wishlist first/);
});
