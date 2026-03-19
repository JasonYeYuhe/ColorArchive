import type { ColorRecord } from "@/src/types/color";

function uniqueOrdered(values: string[]) {
  return [...new Set(values)];
}

export function parsePaletteInput(input: string, colors: readonly ColorRecord[]) {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      ids: [],
      error: "Paste a palette URL, color ids, hex list, or JSON first.",
    };
  }

  const byId = new Map(colors.map((color) => [color.id, color.id]));
  const byHex = new Map(colors.map((color) => [color.hex.toLowerCase(), color.id]));

  try {
    const maybeUrl = new URL(trimmed);
    const idsParam = maybeUrl.searchParams.get("ids");
    if (idsParam) {
      const ids = uniqueOrdered(
        idsParam
          .split(",")
          .map((value) => value.trim())
          .filter((value) => byId.has(value))
          .map((value) => byId.get(value) ?? value),
      );

      return { ids, error: ids.length > 0 ? "" : "The URL did not contain recognizable archive color ids." };
    }
  } catch {
    // Not a URL. Continue parsing.
  }

  try {
    const parsed = JSON.parse(trimmed);
    const values = Array.isArray(parsed)
      ? parsed
      : typeof parsed === "object" && parsed
        ? Object.values(parsed)
        : [];

    const ids = uniqueOrdered(
      values
        .flatMap((entry) => {
          if (typeof entry === "string") {
            return [entry];
          }
          if (entry && typeof entry === "object") {
            const maybeId = "id" in entry && typeof entry.id === "string" ? entry.id : null;
            const maybeHex = "hex" in entry && typeof entry.hex === "string" ? entry.hex : null;
            return [maybeId, maybeHex].filter((value): value is string => Boolean(value));
          }
          return [];
        })
        .map((value) => value.trim().toLowerCase())
        .map((value) => byId.get(value) ?? byHex.get(value.startsWith("#") ? value : `#${value}`))
        .filter((value): value is string => Boolean(value)),
    );

    if (ids.length > 0) {
      return { ids, error: "" };
    }
  } catch {
    // Not JSON. Continue parsing as text.
  }

  const idMatches = trimmed.match(/[a-z0-9]+(?:-[a-z0-9]+)+/gi) ?? [];
  const hexMatches = trimmed.match(/#?[0-9a-fA-F]{6}/g) ?? [];
  const ids = uniqueOrdered([
    ...idMatches
      .map((value) => value.toLowerCase())
      .map((value) => byId.get(value))
      .filter((value): value is string => Boolean(value)),
    ...hexMatches
      .map((value) => value.startsWith("#") ? value.toLowerCase() : `#${value.toLowerCase()}`)
      .map((value) => byHex.get(value))
      .filter((value): value is string => Boolean(value)),
  ]);

  return {
    ids,
    error: ids.length > 0 ? "" : "No recognizable ColorArchive ids or hex values were found.",
  };
}
