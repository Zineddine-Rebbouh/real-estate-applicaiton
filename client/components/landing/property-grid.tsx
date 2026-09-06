import { ListingCard } from "./listing-card";
import Link from "next/link";
const listings = [
  {
    image: "/property-large-flat.jpg",
    title: "221 Bergen Street",
    area: "Park Slope",
    price: "$2,980",
    facts: "1 bed / 1 bath",
  },
  {
    image: "/property-medium-flat.jpg",
    title: "48 Freeman Avenue",
    area: "Greenpoint",
    price: "$3,400",
    facts: "2 beds / 1 bath",
  },
  {
    image: "/property-small-flat.jpg",
    title: "12 Willow Place",
    area: "Brooklyn Heights",
    price: "$2,750",
    facts: "Studio / 1 bath",
  },
];
export function ListingFilmstrip() {
  return (
    <section className="bg-[var(--paper)] pb-20 sm:pb-28" id="listings">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-9 flex items-end justify-between gap-6">
          <div>
            {/* <p className="mb-4 text-sm text-[var(--stone)]">New on Habitat</p> */}
            <h2 className="font-display text-4xl font-semibold leading-none tracking-[-.04em] sm:text-5xl">
              Homes with room to grow.
            </h2>
          </div>
          <Link
            href="/tenant/rentals"
            className="hidden border-b border-[var(--brass)] pb-1 text-sm font-semibold sm:block"
          >
            View all homes
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.title} {...listing} />
          ))}
        </div>
      </div>
    </section>
  );
}
