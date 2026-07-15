export const products = Object.freeze([
  {
    id: "ceramic-morning-mug",
    name: "Morning Glaze Mug",
    price: 34,
    category: "Tableware",
    description: "A hand-finished stoneware mug with a soft, speckled glaze.",
    image: "assets/images/morning-mug.svg",
  },
  {
    id: "linen-throw-sand",
    name: "Woven Linen Throw",
    price: 86,
    category: "Textiles",
    description: "Airy washed linen with a relaxed weave and knotted fringe.",
    image: "assets/images/linen-throw.svg",
  },
  {
    id: "oak-catchall-tray",
    name: "Quiet Oak Tray",
    price: 48,
    category: "Home",
    description: "A gently curved solid-oak tray for keys, jewelry, and rituals.",
    image: "assets/images/oak-tray.svg",
  },
  {
    id: "cedar-fig-candle",
    name: "Cedar & Fig Candle",
    price: 29,
    category: "Scent",
    description: "Warm cedarwood and ripe fig poured into an earthen vessel.",
    image: "assets/images/fig-candle.svg",
  },
  {
    id: "brass-reading-lamp",
    name: "Dawn Reading Lamp",
    price: 128,
    category: "Lighting",
    description: "A warm brass table light with a softly angled linen shade.",
    image: "assets/images/reading-lamp.svg",
  },
  {
    id: "botanical-notebook",
    name: "Botanical Notebook",
    price: 22,
    category: "Stationery",
    description: "Clothbound, lay-flat pages for sketches, lists, and small ideas.",
    image: "assets/images/notebook.svg",
  },
  {
    id: "olive-glass-vase",
    name: "Olive Glass Vase",
    price: 56,
    category: "Decor",
    description: "Mouth-blown recycled glass shaped for garden stems and branches.",
    image: "assets/images/olive-vase.svg",
  },
  {
    id: "wool-sleep-mask",
    name: "Cloud Wool Eye Mask",
    price: 38,
    category: "Wellbeing",
    description: "A softly padded merino mask for deeper rest at home or away.",
    image: "assets/images/eye-mask.svg",
  },
]);

export const productById = new Map(products.map((product) => [product.id, product]));

export function formatPrice(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
