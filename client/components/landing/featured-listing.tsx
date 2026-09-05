import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, Home, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const sampleListing = {
  status: "Ready to sell",
  title: "Real Estate Title",
  address: "Wrocław, ul. Złota 66",
  numberOfFlats: 54,
  totalArea: 960,
  imageSrc: "/featured-listing.jpg",
};

export function FeaturedListing() {
  return (
    <section className="bg-background py-16 lg:py-24" id="about">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              This week&apos;s highlight
            </p>
            <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              A home with a point of view.
            </h2>
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">
            01 / 04 curated residences
          </span>
        </div>
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col justify-between space-y-8">
            <Badge variant="success">{sampleListing.status}</Badge>

            <div className="space-y-4">
              <h3 className="font-display text-2xl font-medium leading-tight tracking-tight sm:text-3xl">
                {sampleListing.title}
              </h3>
              <p className="text-base text-muted-foreground">
                {sampleListing.address}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2 gap-2"
              nativeButton={false}
              render={<Link href="#listings" />}
            >
              View residence <ArrowUpRight className="h-4 w-4" />
            </Button>

            <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Home className="h-5 w-5 text-foreground" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Number of flats
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {sampleListing.numberOfFlats}
                </p>
              </div>

              <div>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Maximize className="h-5 w-5 text-foreground" />
                </div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Total area
                </p>
                <p className="mt-1 text-lg font-semibold">
                  {sampleListing.totalArea}m²
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[360px] overflow-hidden rounded-2xl bg-muted ring-1 ring-foreground/10 sm:min-h-[460px]">
            <Image
              src={sampleListing.imageSrc}
              alt={sampleListing.title}
              fill
              quality={90}
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
