import { describe, expect, it } from "vitest";
import {
  BRAND_CATEGORY_LABELS,
  brandPalettes,
  brandsByCategory,
  getBrandBySlug,
  type BrandCategory,
  type BrandColor,
} from "@/src/lib/brand-palettes";

const HEX = /^#[0-9a-f]{6}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_ROLES: ReadonlyArray<BrandColor["role"]> = [
  "primary",
  "secondary",
  "accent",
  "neutral",
  "background",
];

describe("brandPalettes data integrity", () => {
  it("contains the expected scale (50+ brands across categories)", () => {
    expect(brandPalettes.length).toBeGreaterThanOrEqual(50);
  });

  it("every slug is unique and url-safe", () => {
    const slugs = new Set<string>();
    for (const b of brandPalettes) {
      expect(SLUG.test(b.slug)).toBe(true);
      expect(slugs.has(b.slug)).toBe(false);
      slugs.add(b.slug);
    }
  });

  it("every category is one of the documented union values", () => {
    const knownCategories = new Set(Object.keys(BRAND_CATEGORY_LABELS));
    for (const b of brandPalettes) {
      expect(knownCategories.has(b.category)).toBe(true);
    }
  });

  it("every brand has at least one color, no more than ten", () => {
    for (const b of brandPalettes) {
      expect(b.colors.length).toBeGreaterThanOrEqual(1);
      expect(b.colors.length).toBeLessThanOrEqual(10);
    }
  });

  it("every color has a valid 6-digit hex and a known role", () => {
    for (const b of brandPalettes) {
      for (const c of b.colors) {
        expect(HEX.test(c.hex)).toBe(true);
        expect(VALID_ROLES.includes(c.role)).toBe(true);
        expect(c.name.length).toBeGreaterThan(0);
      }
    }
  });

  it("description and tagline are non-trivial (avoid stub entries)", () => {
    for (const b of brandPalettes) {
      expect(b.tagline.length).toBeGreaterThan(20);
      expect(b.description.length).toBeGreaterThan(120);
    }
  });

  it("each brand declares a source URL and as-of date", () => {
    for (const b of brandPalettes) {
      expect(b.source.url.startsWith("http")).toBe(true);
      expect(b.source.asOf).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe("getBrandBySlug", () => {
  it("returns the brand for a known slug", () => {
    const apple = getBrandBySlug("apple");
    expect(apple?.name).toBe("Apple");
  });

  it("returns undefined for unknown slugs", () => {
    expect(getBrandBySlug("not-a-real-brand")).toBeUndefined();
  });

  it("matches every brand's own slug", () => {
    for (const b of brandPalettes) {
      expect(getBrandBySlug(b.slug)?.slug).toBe(b.slug);
    }
  });
});

describe("brandsByCategory", () => {
  it("partitions every brand into its declared category", () => {
    const map = brandsByCategory();
    let total = 0;
    for (const list of map.values()) total += list.length;
    expect(total).toBe(brandPalettes.length);
  });

  it("at least 5 categories are populated (real diversity, not all-tech)", () => {
    const map = brandsByCategory();
    expect(map.size).toBeGreaterThanOrEqual(5);
  });

  it("each category has a human-readable label", () => {
    const map = brandsByCategory();
    for (const cat of map.keys()) {
      const label = BRAND_CATEGORY_LABELS[cat as BrandCategory];
      expect(label).toBeDefined();
      expect(label.length).toBeGreaterThan(2);
    }
  });
});
