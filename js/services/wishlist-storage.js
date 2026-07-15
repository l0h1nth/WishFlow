export const STORAGE_KEY = "kindred-goods:wishlists";
export const STORAGE_VERSION = 1;

const emptyState = () => ({ version: STORAGE_VERSION, lists: [] });

export function normalizePayload(payload, validProductIds) {
  if (!payload || typeof payload !== "object" || payload.version !== STORAGE_VERSION || !Array.isArray(payload.lists)) {
    return emptyState();
  }

  const seenIds = new Set();
  const seenNames = new Set();
  const lists = [];

  for (const candidate of payload.lists) {
    if (!candidate || typeof candidate !== "object") continue;

    const id = typeof candidate.id === "string" ? candidate.id.trim() : "";
    const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
    const nameKey = name.toLocaleLowerCase();

    if (!id || !name || name.length > 48 || seenIds.has(id) || seenNames.has(nameKey)) continue;

    const rawProductIds = Array.isArray(candidate.productIds) ? candidate.productIds : [];
    const productIds = [...new Set(rawProductIds.filter((productId) => (
      typeof productId === "string" && validProductIds.has(productId)
    )))];

    seenIds.add(id);
    seenNames.add(nameKey);
    lists.push({ id, name, productIds });
  }

  return { version: STORAGE_VERSION, lists };
}

export function createWishlistStorage(storage, validProductIds) {
  return {
    load() {
      let raw;

      try {
        raw = storage.getItem(STORAGE_KEY);
        if (raw === null) return { payload: emptyState(), recovered: false };

        const parsed = JSON.parse(raw);
        const payload = normalizePayload(parsed, validProductIds);
        const recovered = JSON.stringify(parsed) !== JSON.stringify(payload);
        return { payload, recovered };
      } catch {
        return { payload: emptyState(), recovered: true };
      }
    },

    save(payload) {
      try {
        storage.setItem(STORAGE_KEY, JSON.stringify(payload));
        return true;
      } catch {
        return false;
      }
    },
  };
}
