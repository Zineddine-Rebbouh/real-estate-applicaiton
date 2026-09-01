import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Home, Maximize } from "lucide-react";

const sampleListing = {
  status: "Ready to sell",
  title: "Real Estate Title",
  address: "Wrocław, ul. Złota 66",
  numberOfFlats: 54,
  totalArea: 960,
  imageSrc: "/landing-i1.png",
};

export function FeaturedListing() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Column - Content */}
          <div className="space-y-6">
            <Badge variant="success">{sampleListing.status}</Badge>

            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                {sampleListing.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {sampleListing.address}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  <Home className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Number of flats
                  </p>
                  <p className="text-lg font-semibold">{sampleListing.numberOfFlats}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-muted">
                  <Maximize className="h-5 w-5 text-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Total area
                  </p>
                  <p className="text-lg font-semibold">{sampleListing.totalArea}m²</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-foreground/10">
            <Image
              src={sampleListing.imageSrc}
              alt={sampleListing.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
