import { describe, expect, it } from "vitest";
import {
  CONTINENT_LABELS,
  regionPalettes,
  regionsByContinent,
  getRegionBySlug,
  type RegionContinent,
} from "@/src/lib/region-palettes";

const HEX = /^#[0-9a-f]{6}$/i;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

describe("regionPalettes data integrity", () => {
  it("contains the expected scale (10+ regions across continents)", () => {
    expect(regionPalettes.length).toBeGreaterThanOrEqual(10);
  });

  it("every slug is unique and url-safe", () => {
    const slugs = new Set<string>();
    for (const r of regionPalettes) {
      expect(SLUG.test(r.slug)).toBe(true);
      expect(slugs.has(r.slug)).toBe(false);
      slugs.add(r.slug);
    }
  });

  it("every continent value is one of the union members", () => {
    const known = new Set(Object.keys(CONTINENT_LABELS));
    for (const r of regionPalettes) {
      expect(known.has(r.continent)).toBe(true);
    }
  });

  it("every region has between 4 and 10 colors", () => {
    for (const r of regionPalettes) {
      expect(r.colors.length).toBeGreaterThanOrEqual(4);
      expect(r.colors.length).toBeLessThanOrEqual(10);
    }
  });

  it("every color has a valid 6-digit hex, a name, and a source", () => {
    for (const r of regionPalettes) {
      for (const c of r.colors) {
        expect(HEX.test(c.hex)).toBe(true);
        expect(c.name.length).toBeGreaterThan(0);
        expect(c.source.length).toBeGreaterThan(0);
      }
    }
  });

  it("description and tagline are non-trivial", () => {
    for (const r of regionPalettes) {
      expect(r.tagline.length).toBeGreaterThan(20);
      expect(r.description.length).toBeGreaterThan(150);
    }
  });

  it("each region declares at least one use case and one reference", () => {
    for (const r of regionPalettes) {
      expect(r.useCases.length).toBeGreaterThanOrEqual(1);
      expect(r.references.length).toBeGreaterThanOrEqual(1);
      for (const ref of r.references) {
        expect(ref.url.startsWith("http")).toBe(true);
        expect(ref.label.length).toBeGreaterThan(0);
      }
    }
  });

  it("covers at least 4 continents (real diversity)", () => {
    const continents = new Set<RegionContinent>(regionPalettes.map((r) => r.continent));
    expect(continents.size).toBeGreaterThanOrEqual(4);
  });
});

describe("getRegionBySlug", () => {
  it("returns the region for a known slug", () => {
    const japan = getRegionBySlug("japan");
    expect(japan?.name).toBe("Japan");
  });

  it("returns undefined for unknown slugs", () => {
    expect(getRegionBySlug("not-a-real-region")).toBeUndefined();
  });

  it("matches every region's own slug", () => {
    for (const r of regionPalettes) {
      expect(getRegionBySlug(r.slug)?.slug).toBe(r.slug);
    }
  });
});

describe("regionsByContinent", () => {
  it("partitions every region into its declared continent", () => {
    const map = regionsByContinent();
    let total = 0;
    for (const list of map.values()) total += list.length;
    expect(total).toBe(regionPalettes.length);
  });

  it("each continent key has a label", () => {
    const map = regionsByContinent();
    for (const cont of map.keys()) {
      expect(CONTINENT_LABELS[cont as RegionContinent]).toBeDefined();
    }
  });
});
