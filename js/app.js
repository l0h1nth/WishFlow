import { productById, products } from "./data/products.js";
import { filterProducts, getProductCategories } from "./services/catalog-filter.js";
import { createWishlistStorage } from "./services/wishlist-storage.js";
import { WishlistError, WishlistStore } from "./state/wishlist-store.js";
import { productGridTemplate, wishlistsTemplate } from "./ui/templates.js";

const validProductIds = new Set(products.map((product) => product.id));
const storage = createWishlistStorage(window.localStorage, validProductIds);
const store = new WishlistStore({ products, storage });

const elements = {
  productGrid: document.querySelector("#product-grid"),
  productTotal: document.querySelector("#product-total"),
  catalogFilters: document.querySelector("#catalog-filters"),
  productSearch: document.querySelector("#product-search"),
  categoryFilter: document.querySelector("#category-filter"),
  catalogEmpty: document.querySelector("#catalog-empty"),
  wishlistContent: document.querySelector("#wishlist-content"),
  wishlistCount: document.querySelector("#wishlist-count"),
  createDialog: document.querySelector("#create-dialog"),
  createForm: document.querySelector("#create-form"),
  createError: document.querySelector("#create-error"),
  confirmDialog: document.querySelector("#confirm-dialog"),
  confirmTitle: document.querySelector("#confirm-title"),
  confirmMessage: document.querySelector("#confirm-message"),
  confirmAccept: document.querySelector("[data-confirm-accept]"),
  toast: document.querySelector("#toast"),
};

let activeListId = null;
let pendingConfirmation = null;
let toastTimer = null;

function routeName() {
  return window.location.hash === "#wishlists" ? "wishlists" : "shop";
}

function render() {
  const lists = store.getLists();
  if (!lists.some((list) => list.id === activeListId)) activeListId = lists[0]?.id ?? null;

  renderCatalog(lists);
  elements.wishlistContent.innerHTML = wishlistsTemplate(lists, activeListId, productById);
  elements.wishlistCount.textContent = String(lists.length);
  elements.wishlistCount.setAttribute("aria-label", `${lists.length} ${lists.length === 1 ? "wishlist" : "wishlists"}`);
  renderRoute();
}

function renderCatalog(lists = store.getLists()) {
  const query = elements.productSearch.value;
  const category = elements.categoryFilter.value;
  const filteredProducts = filterProducts(products, { query, category });
  const hasFilters = Boolean(query.trim() || category);

  elements.productGrid.innerHTML = productGridTemplate(filteredProducts, lists);
  elements.productGrid.hidden = filteredProducts.length === 0;
  elements.catalogEmpty.hidden = filteredProducts.length !== 0;
  elements.productTotal.textContent = hasFilters
    ? `${filteredProducts.length} of ${products.length} pieces`
    : `${products.length} considered pieces`;
  document.querySelectorAll("[data-clear-filters]").forEach((button) => {
    if (button.closest(".catalog-toolbar")) button.hidden = !hasFilters;
  });
}

function renderRoute() {
  const route = routeName();
  document.querySelectorAll("[data-view]").forEach((view) => {
    view.hidden = view.dataset.view !== route;
  });
  document.querySelectorAll("[data-route-link]").forEach((link) => {
    if (link.dataset.routeLink === route) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  document.title = route === "wishlists" ? "Your Wishlists — WishFlow" : "WishFlow";
}

function showToast(message, tone = "success") {
  window.clearTimeout(toastTimer);
  elements.toast.textContent = message;
  elements.toast.dataset.tone = tone;
  elements.toast.hidden = false;
  toastTimer = window.setTimeout(() => {
    elements.toast.hidden = true;
  }, 3600);
}

function handleError(error, target = null) {
  const message = error instanceof WishlistError ? error.message : "Something unexpected happened. Please try again.";
  if (target) target.textContent = message;
  else showToast(message, "error");
}

function openCreateDialog() {
  elements.createForm.reset();
  elements.createError.textContent = "";
  elements.createDialog.showModal();
  window.setTimeout(() => document.querySelector("#wishlist-name").focus(), 0);
}

function askForConfirmation({ title, message, buttonLabel, action }) {
  elements.confirmTitle.textContent = title;
  elements.confirmMessage.textContent = message;
  elements.confirmAccept.textContent = buttonLabel;
  pendingConfirmation = action;
  elements.confirmDialog.showModal();
}

function closeDialog(dialog) {
  if (dialog.open) dialog.close();
}

function revealActiveList() {
  if (routeName() !== "wishlists") return;
  window.requestAnimationFrame(() => {
    const panel = document.querySelector(".list-panel");
    const header = document.querySelector(".site-header");
    if (!panel) return;
    panel.scrollIntoView({ block: "start" });
    window.scrollBy(0, -(header?.offsetHeight ?? 78) - 24);
  });
}

document.addEventListener("click", (event) => {
  if (event.target.closest("[data-clear-filters]")) {
    elements.catalogFilters.reset();
    renderCatalog();
    elements.productSearch.focus();
    return;
  }

  const openCreate = event.target.closest("[data-open-create]");
  if (openCreate) {
    openCreateDialog();
    return;
  }

  if (event.target.closest("[data-close-dialog]")) {
    closeDialog(elements.createDialog);
    return;
  }

  if (event.target.closest("[data-confirm-cancel]")) {
    pendingConfirmation = null;
    closeDialog(elements.confirmDialog);
    return;
  }

  if (event.target.closest("[data-confirm-accept]")) {
    const action = pendingConfirmation;
    pendingConfirmation = null;
    closeDialog(elements.confirmDialog);
    action?.();
    return;
  }

  const selectList = event.target.closest("[data-select-list]");
  if (selectList) {
    activeListId = selectList.dataset.selectList;
    render();
    document.querySelector(`[data-select-list="${CSS.escape(activeListId)}"]`)?.focus();
    return;
  }

  const removeProduct = event.target.closest("[data-remove-product]");
  if (removeProduct) {
    try {
      const product = productById.get(removeProduct.dataset.removeProduct);
      store.remove(removeProduct.dataset.listId, removeProduct.dataset.removeProduct);
      render();
      showToast(`${product?.name ?? "Item"} removed from the wishlist.`);
    } catch (error) {
      handleError(error);
    }
    return;
  }

  const deleteList = event.target.closest("[data-delete-list]");
  if (deleteList) {
    const list = store.getLists().find((candidate) => candidate.id === deleteList.dataset.deleteList);
    if (!list) return;
    askForConfirmation({
      title: `Delete “${list.name}”?`,
      message: "This removes the wishlist and all of its saved items. This action cannot be undone.",
      buttonLabel: "Delete wishlist",
      action: () => {
        try {
          store.delete(list.id);
          render();
          showToast(`“${list.name}” was deleted.`);
        } catch (error) {
          handleError(error);
        }
      },
    });
  }
});

elements.catalogFilters.addEventListener("submit", (event) => event.preventDefault());
elements.productSearch.addEventListener("input", () => renderCatalog());
elements.categoryFilter.addEventListener("change", () => renderCatalog());

document.addEventListener("submit", (event) => {
  const addForm = event.target.closest("[data-add-product]");
  if (addForm) {
    event.preventDefault();
    const formData = new FormData(addForm);
    const product = productById.get(addForm.dataset.addProduct);
    const list = store.getLists().find((candidate) => candidate.id === formData.get("listId"));
    try {
      store.add(formData.get("listId"), addForm.dataset.addProduct);
      render();
      showToast(`${product.name} saved to “${list.name}”.`);
    } catch (error) {
      handleError(error);
    }
    return;
  }

  const mergeForm = event.target.closest("[data-merge-form]");
  if (mergeForm) {
    event.preventDefault();
    const formData = new FormData(mergeForm);
    const sourceId = formData.get("sourceId");
    const destinationId = formData.get("destinationId");
    const lists = store.getLists();
    const source = lists.find((list) => list.id === sourceId);
    const destination = lists.find((list) => list.id === destinationId);

    if (sourceId === destinationId) {
      handleError(new WishlistError("SAME_LIST"));
      return;
    }

    if (!source || !destination) {
      handleError(new WishlistError("LIST_NOT_FOUND"));
      return;
    }

    askForConfirmation({
      title: `Merge “${source.name}” into “${destination.name}”?`,
      message: `Unique items will be added to “${destination.name}”, and “${source.name}” will be permanently deleted.`,
      buttonLabel: "Merge wishlists",
      action: () => {
        try {
          store.merge(sourceId, destinationId);
          activeListId = destinationId;
          render();
          revealActiveList();
          showToast(`Merged into “${destination.name}”.`);
        } catch (error) {
          handleError(error);
        }
      },
    });
  }
});

elements.createForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(elements.createForm);
  try {
    const list = store.create(formData.get("name"));
    activeListId = list.id;
    closeDialog(elements.createDialog);
    render();
    revealActiveList();
    showToast(`“${list.name}” is ready for favorites.`);
  } catch (error) {
    handleError(error, elements.createError);
  }
});

elements.createDialog.addEventListener("click", (event) => {
  if (event.target === elements.createDialog) closeDialog(elements.createDialog);
});

elements.confirmDialog.addEventListener("click", (event) => {
  if (event.target === elements.confirmDialog) {
    pendingConfirmation = null;
    closeDialog(elements.confirmDialog);
  }
});

document.addEventListener("keydown", (event) => {
  const currentTab = event.target.closest?.("[role='tab']");
  if (!currentTab || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

  const tabs = [...document.querySelectorAll("[role='tab']")];
  const index = tabs.indexOf(currentTab);
  let nextIndex = index;
  if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
  if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
  if (event.key === "Home") nextIndex = 0;
  if (event.key === "End") nextIndex = tabs.length - 1;
  event.preventDefault();
  tabs[nextIndex].click();
});

window.addEventListener("hashchange", renderRoute);

for (const category of getProductCategories(products)) {
  const option = document.createElement("option");
  option.value = category;
  option.textContent = category;
  elements.categoryFilter.append(option);
}

if (!window.location.hash) window.history.replaceState(null, "", "#shop");
render();

if (store.recovered) {
  showToast("Stored wishlist data was invalid and has been safely reset.", "error");
}
