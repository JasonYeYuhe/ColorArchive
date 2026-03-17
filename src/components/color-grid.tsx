import { ColorCard } from "@/src/components/color-card";
import type { ColorRecord } from "@/src/types/color";

interface ColorGridProps {
  colors: readonly ColorRecord[];
}

export function ColorGrid({ colors }: ColorGridProps) {
  if (colors.length === 0) {
    return (
      <section className="glass-panel rounded-[1.75rem] px-6 py-12 text-center">
        <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">No colors found</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Refine the search term or clear the family filter to widen the archive.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4" aria-label="Color archive">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-neutral-950">Archive</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Curated swatches arranged for fast scanning and comparison.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {colors.map((color) => (
          <ColorCard key={color.id} color={color} />
        ))}
      </div>
    </section>
  );
}
