import Link from "next/link";

interface WhatsNextItem {
  href: string;
  label: string;
  desc: string;
}

interface WhatsNextProps {
  items: WhatsNextItem[];
}

export function WhatsNext({ items }: WhatsNextProps) {
  return (
    <section className="mt-8 rounded-2xl border border-black/6 bg-white/60 p-5 dark:border-white/8 dark:bg-white/4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400 mb-3">
        What&apos;s next
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(({ href, label, desc }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col gap-1 rounded-xl border border-black/6 bg-white px-4 py-3 transition hover:border-indigo-200 hover:shadow-sm dark:border-white/8 dark:bg-white/5 dark:hover:border-indigo-800"
          >
            <span className="text-sm font-semibold text-neutral-800 dark:text-white">{label}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">{desc}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
