import { formatPrice } from "../data/products.js";

export function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function wishlistOptions(lists, selectedId = "") {
  if (!lists.length) return '<option value="">Create a wishlist first</option>';
  return lists.map((list) => (
    `<option value="${escapeHtml(list.id)}"${list.id === selectedId ? " selected" : ""}>${escapeHtml(list.name)}</option>`
  )).join("");
}

export function productGridTemplate(products, lists) {
  return products.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" width="640" height="800">
        <span class="category-pill">${escapeHtml(product.category)}</span>
      </div>
      <div class="product-meta">
        <h3>${escapeHtml(product.name)}</h3>
        <span class="product-price">${formatPrice(product.price)}</span>
      </div>
      <p class="product-description">${escapeHtml(product.description)}</p>
      <form class="add-form" data-add-product="${escapeHtml(product.id)}">
        <label class="visually-hidden" for="list-${escapeHtml(product.id)}">Wishlist for ${escapeHtml(product.name)}</label>
        <select class="select-input" id="list-${escapeHtml(product.id)}" name="listId" ${lists.length ? "" : "disabled"}>
          ${wishlistOptions(lists)}
        </select>
        <button class="button button-secondary" type="submit" ${lists.length ? "" : "disabled"}>Save <span aria-hidden="true">♡</span></button>
      </form>
    </article>
  `).join("");
}

function savedProductTemplate(product, listId) {
  return `
    <article class="saved-product">
      <div class="product-image-wrap">
        <img class="product-image" src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}" width="640" height="800">
        <span class="category-pill">${escapeHtml(product.category)}</span>
      </div>
      <div class="saved-product-row">
        <div>
          <h3>${escapeHtml(product.name)}</h3>
          <span class="product-price">${formatPrice(product.price)}</span>
        </div>
        <button class="remove-button" type="button" data-remove-product="${escapeHtml(product.id)}" data-list-id="${escapeHtml(listId)}" aria-label="Remove ${escapeHtml(product.name)} from wishlist">Remove</button>
      </div>
    </article>
  `;
}

function mergeTemplate(lists, activeListId) {
  if (lists.length < 2) {
    return `
      <div class="merge-card">
        <h3>Merge wishlists</h3>
        <p>Create one more wishlist to combine collections. Unique items will be kept automatically.</p>
        <button class="button button-secondary" type="button" data-open-create>Create another wishlist</button>
      </div>
    `;
  }

  const destination = lists.find((list) => list.id !== activeListId)?.id ?? "";
  return `
    <div class="merge-card">
      <h3>Merge wishlists</h3>
      <p>Move unique items from one list into another. The source list will be deleted after confirmation.</p>
      <form class="merge-form" data-merge-form>
        <div class="field-group">
          <label class="field-label" for="merge-source">Source list</label>
          <select class="select-input" id="merge-source" name="sourceId">
            ${wishlistOptions(lists, activeListId)}
          </select>
        </div>
        <span class="merge-arrow" aria-hidden="true">→</span>
        <div class="field-group">
          <label class="field-label" for="merge-destination">Destination list</label>
          <select class="select-input" id="merge-destination" name="destinationId">
            ${wishlistOptions(lists, destination)}
          </select>
        </div>
        <button class="button button-secondary" type="submit">Merge lists</button>
      </form>
    </div>
  `;
}

export function wishlistsTemplate(lists, activeListId, productById) {
  if (!lists.length) {
    return `
      <div class="empty-state">
        <div>
          <span class="empty-state-icon" aria-hidden="true">♡</span>
          <h2>No wishlists yet</h2>
          <p>Create a named collection, then save anything that feels worth coming back to.</p>
          <button class="button button-primary" type="button" data-open-create>Create your first wishlist</button>
        </div>
      </div>
    `;
  }

  const activeList = lists.find((list) => list.id === activeListId) ?? lists[0];
  const products = activeList.productIds.map((id) => productById.get(id)).filter(Boolean);
  const tabs = lists.map((list) => `
    <button class="wishlist-tab" type="button" role="tab" data-select-list="${escapeHtml(list.id)}" aria-selected="${list.id === activeList.id}" tabindex="${list.id === activeList.id ? "0" : "-1"}">
      <span>${escapeHtml(list.name)}</span>
      <span class="tab-count" aria-label="${list.productIds.length} items">${list.productIds.length}</span>
    </button>
  `).join("");

  const productContent = products.length
    ? `<div class="saved-product-grid">${products.map((product) => savedProductTemplate(product, activeList.id)).join("")}</div>`
    : `
      <div class="empty-state empty-state-compact">
        <div>
          <span class="empty-state-icon" aria-hidden="true">＋</span>
          <h3>This wishlist is ready</h3>
          <p>Browse the collection and save something you love to “${escapeHtml(activeList.name)}”.</p>
          <a class="button button-secondary" href="#shop">Browse products</a>
        </div>
      </div>
    `;

  return `
    <div class="wishlist-layout">
      <aside class="wishlist-sidebar" aria-label="Your wishlists">
        <p class="sidebar-label">Collections</p>
        <div class="wishlist-tabs" role="tablist" aria-label="Choose a wishlist">${tabs}</div>
      </aside>
      <section class="list-panel" role="tabpanel" aria-label="${escapeHtml(activeList.name)}">
        <div class="list-panel-header">
          <div>
            <h2>${escapeHtml(activeList.name)}</h2>
            <p>${products.length} ${products.length === 1 ? "item" : "items"} saved</p>
          </div>
          <button class="button button-quiet-danger" type="button" data-delete-list="${escapeHtml(activeList.id)}">Delete list</button>
        </div>
        ${productContent}
        ${mergeTemplate(lists, activeList.id)}
      </section>
    </div>
  `;
}
