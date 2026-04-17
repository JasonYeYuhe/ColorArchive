import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as listColors } from "@/app/api/colors/route";
import { GET as getColor } from "@/app/api/colors/[id]/route";

function makeListReq(params: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/colors");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new NextRequest(url.toString());
}

// ---------------------------------------------------------------------------
// GET /api/colors (list)
// ---------------------------------------------------------------------------

describe("GET /api/colors", () => {
  it("returns default 50 results", async () => {
    const res = listColors(makeListReq());
    const data = await res.json();
    expect(data.limit).toBe(50);
    expect(data.offset).toBe(0);
    expect(data.colors).toHaveLength(50);
    expect(data.total).toBeGreaterThan(100);
  });

  it("respects limit param", async () => {
    const res = listColors(makeListReq({ limit: "10" }));
    const data = await res.json();
    expect(data.colors).toHaveLength(10);
    expect(data.limit).toBe(10);
  });

  it("clamps limit to max 200", async () => {
    const res = listColors(makeListReq({ limit: "999" }));
    const data = await res.json();
    expect(data.limit).toBe(200);
  });

  it("clamps limit to min 1 for negative values", async () => {
    const res = listColors(makeListReq({ limit: "-5" }));
    const data = await res.json();
    expect(data.limit).toBe(1);
  });

  it("respects offset for pagination", async () => {
    const d1 = await listColors(makeListReq({ limit: "5", offset: "0" })).json();
    const d2 = await listColors(makeListReq({ limit: "5", offset: "5" })).json();
    expect(d1.offset).toBe(0);
    expect(d2.offset).toBe(5);
    expect(d1.colors[0].id).not.toBe(d2.colors[0].id);
  });

  it("filters by valid family", async () => {
    const data = await listColors(makeListReq({ family: "Blue", limit: "50" })).json();
    expect(data.colors.length).toBeGreaterThan(0);
    expect(data.colors.every((c: { family: string }) => c.family === "Blue")).toBe(true);
  });

  it("falls back to All for invalid family param", async () => {
    const all = await listColors(makeListReq()).json();
    const invalid = await listColors(makeListReq({ family: "Rainbow" })).json();
    expect(invalid.total).toBe(all.total);
  });

  it("sorts by lightness ascending", async () => {
    const data = await listColors(makeListReq({ sort: "lightness", limit: "30" })).json();
    for (let i = 1; i < data.colors.length; i++) {
      expect(data.colors[i].lightness).toBeGreaterThanOrEqual(data.colors[i - 1].lightness);
    }
  });

  it("sorts by name alphabetically", async () => {
    const data = await listColors(makeListReq({ sort: "name", limit: "30" })).json();
    for (let i = 1; i < data.colors.length; i++) {
      expect(data.colors[i].name.localeCompare(data.colors[i - 1].name)).toBeGreaterThanOrEqual(0);
    }
  });

  it("falls back to hue sort for invalid sort param", async () => {
    const hue = await listColors(makeListReq({ sort: "hue", limit: "5" })).json();
    const bad = await listColors(makeListReq({ sort: "bogus", limit: "5" })).json();
    expect(bad.colors[0].id).toBe(hue.colors[0].id);
  });

  it("filters by query string", async () => {
    const data = await listColors(makeListReq({ q: "amber", limit: "100" })).json();
    expect(data.total).toBeGreaterThan(0);
    expect(data.total).toBeLessThan(5446);
  });

  it("includes Cache-Control header", async () => {
    const res = listColors(makeListReq());
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=86400");
  });

  it("response has correct shape", async () => {
    const data = await listColors(makeListReq()).json();
    expect(data).toMatchObject({
      total: expect.any(Number),
      limit: expect.any(Number),
      offset: expect.any(Number),
      colors: expect.any(Array),
    });
    const c = data.colors[0];
    expect(c).toHaveProperty("id");
    expect(c).toHaveProperty("hex");
    expect(c).toHaveProperty("family");
    expect(c).toHaveProperty("hue");
  });
});

// ---------------------------------------------------------------------------
// GET /api/colors/:id (detail)
// ---------------------------------------------------------------------------

describe("GET /api/colors/:id", () => {
  function getById(id: string) {
    return getColor(new Request("http://localhost"), {
      params: Promise.resolve({ id }),
    });
  }

  it("returns color by valid slug", async () => {
    const res = await getById("amber-pearl-muted");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe("amber-pearl-muted");
  });

  it("returns color by hex code (no #)", async () => {
    const listData = await listColors(makeListReq({ limit: "1" })).json();
    const hex = listData.colors[0].hex.replace("#", "");
    const expectedId = listData.colors[0].id;

    const res = await getById(hex);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(expectedId);
  });

  it("hex lookup is case-insensitive", async () => {
    const listData = await listColors(makeListReq({ limit: "1" })).json();
    const hex = listData.colors[0].hex.replace("#", "");

    const upper = await getById(hex.toUpperCase());
    const lower = await getById(hex.toLowerCase());
    expect(upper.status).toBe(200);
    expect(lower.status).toBe(200);
  });

  it("returns 404 for unknown slug", async () => {
    const res = await getById("not-a-real-color-xyz");
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Color not found");
  });

  it("includes all relationship types", async () => {
    const res = await getById("cobalt-shadow-vivid");
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.relationships).toMatchObject({
      analogous: expect.any(Array),
      complementary: expect.anything(),
      triadic: expect.any(Array),
      splitComplementary: expect.any(Array),
      nearest: expect.any(Array),
    });
  });

  it("includes Cache-Control header", async () => {
    const res = await getById("amber-pearl-muted");
    expect(res.headers.get("Cache-Control")).toContain("s-maxage=86400");
  });
});
