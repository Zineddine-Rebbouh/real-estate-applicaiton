import Image from "next/image";

const galleryImages = [
  { src: "/landing-i5.png", alt: "Modern living room" },
  { src: "/landing-i6.png", alt: "Luxury bedroom" },
  { src: "/landing-i7.png", alt: "Contemporary kitchen" },
];

export function Gallery() {
  return (
    <section className="bg-background py-16 lg:py-24" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Inside the collection
            </p>
            <h2 className="font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
              Spaces that make room for living.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            A glimpse into the details, textures, and light behind our most
            loved homes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl ring-1 ring-foreground/10 transition-all hover:ring-foreground/20 ${index === 1 ? "sm:col-span-6 sm:aspect-[1/1]" : "sm:col-span-3 sm:aspect-[3/4]"}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
