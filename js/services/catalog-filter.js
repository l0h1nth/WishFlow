function normalize(value) {
  return String(value ?? "").trim().toLocaleLowerCase();
}

export function getProductCategories(products) {
  return [...new Set(products.map((product) => product.category))]
    .sort((first, second) => first.localeCompare(second));
}

export function filterProducts(products, { query = "", category = "" } = {}) {
  const normalizedQuery = normalize(query);

  return products.filter((product) => {
    const matchesCategory = !category || product.category === category;
    const searchableText = normalize(`${product.name} ${product.description} ${product.category}`);
    const matchesQuery = !normalizedQuery || searchableText.includes(normalizedQuery);
    return matchesCategory && matchesQuery;
  });
}
