const ERROR_MESSAGES = Object.freeze({
  EMPTY_NAME: "Enter a name for your wishlist.",
  DUPLICATE_NAME: "A wishlist with that name already exists.",
  LIST_NOT_FOUND: "That wishlist is no longer available.",
  PRODUCT_NOT_FOUND: "That product is no longer available.",
  DUPLICATE_PRODUCT: "That item is already in this wishlist.",
  SAME_LIST: "Choose two different wishlists to merge.",
  STORAGE_UNAVAILABLE: "Your changes could not be saved in this browser.",
});

export class WishlistError extends Error {
  constructor(code) {
    super(ERROR_MESSAGES[code] ?? "Something went wrong.");
    this.name = "WishlistError";
    this.code = code;
  }
}

function makeId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `list-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function copyLists(lists) {
  return lists.map((list) => ({ ...list, productIds: [...list.productIds] }));
}

export class WishlistStore {
  constructor({ products, storage }) {
    this.productIds = new Set(products.map((product) => product.id));
    this.storage = storage;
    const result = storage.load();
    this.lists = result.payload.lists;
    this.recovered = result.recovered;
  }

  getLists() {
    return copyLists(this.lists);
  }

  create(nameInput) {
    const name = String(nameInput ?? "").trim();
    if (!name) throw new WishlistError("EMPTY_NAME");
    if (this.lists.some((list) => list.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      throw new WishlistError("DUPLICATE_NAME");
    }

    const list = { id: makeId(), name: name.slice(0, 48), productIds: [] };
    this.commit([...this.lists, list]);
    return { ...list, productIds: [] };
  }

  delete(listId) {
    this.requireList(listId);
    this.commit(this.lists.filter((list) => list.id !== listId));
  }

  add(listId, productId) {
    const list = this.requireList(listId);
    if (!this.productIds.has(productId)) throw new WishlistError("PRODUCT_NOT_FOUND");
    if (list.productIds.includes(productId)) throw new WishlistError("DUPLICATE_PRODUCT");

    this.commit(this.lists.map((candidate) => (
      candidate.id === listId
        ? { ...candidate, productIds: [...candidate.productIds, productId] }
        : candidate
    )));
  }

  remove(listId, productId) {
    this.requireList(listId);
    this.commit(this.lists.map((candidate) => (
      candidate.id === listId
        ? { ...candidate, productIds: candidate.productIds.filter((id) => id !== productId) }
        : candidate
    )));
  }

  merge(sourceId, destinationId) {
    if (sourceId === destinationId) throw new WishlistError("SAME_LIST");
    const source = this.requireList(sourceId);
    const destination = this.requireList(destinationId);
    const productIds = [...new Set([...destination.productIds, ...source.productIds])];

    const nextLists = this.lists
      .filter((list) => list.id !== sourceId)
      .map((list) => list.id === destinationId ? { ...list, productIds } : list);

    this.commit(nextLists);
    return { ...destination, productIds };
  }

  requireList(listId) {
    const list = this.lists.find((candidate) => candidate.id === listId);
    if (!list) throw new WishlistError("LIST_NOT_FOUND");
    return list;
  }

  commit(nextLists) {
    const payload = { version: 1, lists: copyLists(nextLists) };
    if (!this.storage.save(payload)) throw new WishlistError("STORAGE_UNAVAILABLE");
    this.lists = nextLists;
  }
}
