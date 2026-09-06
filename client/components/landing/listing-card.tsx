import Image from "next/image";
import Link from "next/link";
type ListingCardProps = {
  image: string;
  title: string;
  area: string;
  price: string;
  facts: string;
};
export function ListingCard({
  image,
  title,
  area,
  price,
  facts,
}: ListingCardProps) {
  return (
    <article>
      <Link
        href="/tenant/rentals"
        className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--brass)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-[var(--blueprint)]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="border-b border-[var(--blueprint-line)]/60 py-4">
          <div className="flex justify-between gap-3">
            <div>
              <h3 className="font-display text-xl font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-[var(--stone)]">{area}</p>
            </div>
            <p className="text-sm font-semibold">
              {price}
              <span className="block font-normal text-[var(--stone)]">
                / mo
              </span>
            </p>
          </div>
          <p className="mt-3 text-xs text-[var(--stone)]">{facts}</p>
        </div>
      </Link>
    </article>
  );
}
