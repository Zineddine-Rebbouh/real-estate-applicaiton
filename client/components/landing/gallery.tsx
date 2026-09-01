import Image from "next/image";

const galleryImages = [
  { src: "/landing-i5.png", alt: "Modern living room" },
  { src: "/landing-i6.png", alt: "Luxury bedroom" },
  { src: "/landing-i7.png", alt: "Contemporary kitchen" },
];

export function Gallery() {
  return (
    <section className="py-16 lg:py-24 bg-background" id="gallery">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-8">
          Gallery
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-[4/3] rounded-xl overflow-hidden ring-1 ring-foreground/10 hover:ring-foreground/20 transition-all"
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
