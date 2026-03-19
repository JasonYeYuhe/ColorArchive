import type { ColorRecord } from "@/src/types/color";

interface RecommendationOptions {
  colors: readonly ColorRecord[];
  seedIds: string[];
  excludeIds?: string[];
  limit?: number;
}

function uniqueIds(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function hueDistance(left: number, right: number) {
  const direct = Math.abs(left - right);
  return Math.min(direct, 360 - direct);
}

export function buildRecommendedColors({
  colors,
  seedIds,
  excludeIds = [],
  limit = 8,
}: RecommendationOptions) {
  const uniqueSeedIds = uniqueIds(seedIds);
  const excluded = new Set(uniqueIds([...excludeIds, ...uniqueSeedIds]));
  const seeds = uniqueSeedIds
    .map((id) => colors.find((color) => color.id === id))
    .filter((color): color is ColorRecord => Boolean(color));

  if (seeds.length === 0) {
    return [];
  }

  const familyCounts = new Map<string, number>();
  seeds.forEach((seed) => {
    familyCounts.set(seed.family, (familyCounts.get(seed.family) ?? 0) + 1);
  });

  const avgHue = average(seeds.map((seed) => seed.hue));
  const avgSaturation = average(seeds.map((seed) => seed.saturation));
  const avgLightness = average(seeds.map((seed) => seed.lightness));

  const ranked = colors
    .filter((color) => !excluded.has(color.id))
    .map((color) => {
      const sameFamilyWeight = familyCounts.get(color.family) ?? 0;
      const hueScore = 1 - Math.min(hueDistance(color.hue, avgHue) / 180, 1);
      const saturationScore = 1 - Math.min(Math.abs(color.saturation - avgSaturation) / 100, 1);
      const lightnessScore = 1 - Math.min(Math.abs(color.lightness - avgLightness) / 100, 1);
      const contrastBonus =
        seeds.some((seed) => hueDistance(seed.hue, color.hue) >= 18 && hueDistance(seed.hue, color.hue) <= 70)
          ? 0.12
          : 0;

      const score =
        sameFamilyWeight * 1.8 +
        hueScore * 2.2 +
        saturationScore * 1.1 +
        lightnessScore * 1.1 +
        contrastBonus;

      return { color, score };
    })
    .sort((left, right) => right.score - left.score);

  const familySeen = new Set<string>();
  const recommendations: ColorRecord[] = [];

  for (const entry of ranked) {
    const shouldDiversify =
      familySeen.size > 0 && familySeen.size < 4 && familySeen.has(entry.color.family);

    if (shouldDiversify) {
      continue;
    }

    recommendations.push(entry.color);
    familySeen.add(entry.color.family);

    if (recommendations.length >= limit) {
      break;
    }
  }

  if (recommendations.length < limit) {
    for (const entry of ranked) {
      if (recommendations.some((color) => color.id === entry.color.id)) {
        continue;
      }

      recommendations.push(entry.color);
      if (recommendations.length >= limit) {
        break;
      }
    }
  }

  return recommendations;
}
