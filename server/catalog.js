const productCatalog = [
  {
    packId: "palette-pack-vol-1",
    title: "Palette Pack Vol. 1",
    downloadPath: "/downloads/palette-pack-vol-1.zip",
    packPath: "/packs/palette-pack-vol-1",
    productNames: ["palette pack vol. 1"],
  },
  {
    packId: "brand-starter-kit",
    title: "Brand Color Starter Kit",
    downloadPath: "/downloads/brand-starter-kit.zip",
    packPath: "/packs/brand-starter-kit",
    productNames: ["brand color starter kit"],
  },
  {
    packId: "content-creator-bundle",
    title: "Creator Bundle",
    downloadPath: "/downloads/content-creator-bundle.zip",
    packPath: "/packs/content-creator-bundle",
    productNames: ["creator bundle", "content creator bundle"],
  },
  {
    packId: "complete-archive",
    title: "Complete Archive Token Set",
    downloadPath: "/downloads/complete-archive.zip",
    packPath: "/packs/complete-archive",
    productNames: ["complete archive token set", "complete archive"],
  },
  {
    packId: "dark-mode-ui-kit",
    title: "Dark Mode UI Kit",
    downloadPath: "/downloads/dark-mode-ui-kit.zip",
    packPath: "/packs/dark-mode-ui-kit",
    productNames: ["dark mode ui kit"],
  },
  {
    packId: "seasonal-spring-2026",
    title: "Seasonal: Spring 2026",
    downloadPath: "/downloads/seasonal-spring-2026.zip",
    packPath: "/packs/seasonal-spring-2026",
    productNames: ["seasonal: spring 2026", "seasonal spring 2026"],
  },
  {
    packId: "all-access-bundle",
    title: "All Access Bundle",
    downloadPath: "/downloads/complete-archive.zip",
    packPath: "/packs/all-access-bundle",
    productNames: ["all access bundle"],
  },
];

function normalizeProductName(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function getFrontendOrigin() {
  return process.env.FRONTEND_ORIGIN || "https://colorarchive.me";
}

function findCatalogProduct(productName) {
  const normalized = normalizeProductName(productName);
  return (
    productCatalog.find((entry) => entry.packId === normalized) ??
    productCatalog.find((entry) => entry.productNames.includes(normalized)) ??
    productCatalog.find((entry) => normalized.includes(entry.packId.replaceAll("-", " "))) ??
    null
  );
}

function getDownloadUrl(productName) {
  const product = findCatalogProduct(productName);
  return product ? `${getFrontendOrigin()}${product.downloadPath}` : null;
}

function getPackUrl(productName) {
  const product = findCatalogProduct(productName);
  return product ? `${getFrontendOrigin()}${product.packPath}` : null;
}

module.exports = {
  findCatalogProduct,
  getDownloadUrl,
  getPackUrl,
};
