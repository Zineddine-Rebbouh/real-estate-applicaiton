import Image from "next/image";
const spaces = [
  {
    src: "/gallery-living-room.jpg",
    alt: "Living room with warm afternoon light",
    cl: "sm:col-span-7 sm:row-span-2 min-h-[360px]",
  },
  {
    src: "/gallery-kitchen.jpg",
    alt: "Bright kitchen",
    cl: "sm:col-span-5 min-h-[220px]",
  },
  {
    src: "/gallery-bedroom.jpg",
    alt: "Quiet bedroom",
    cl: "sm:col-span-5 min-h-[220px]",
  },
];
export function SpacesGallery() {
  return (
    <section
      className="bg-[var(--blueprint)] py-20 text-white sm:py-28"
      id="gallery"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="mb-10 grid gap-6 sm:grid-cols-[1fr_.65fr]">
          <h2 className="font-display max-w-xl text-4xl font-semibold leading-none tracking-[-.04em] sm:text-5xl">
            Spaces that make room for living.
          </h2>
          <p className="self-end leading-7 text-white/70">
            Light, storage, a table where friends can stay awhile. The details
            are part of the home not an afterthought.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-12 sm:grid-rows-2">
          {spaces.map((space) => (
            <div
              key={space.src}
              className={`relative overflow-hidden ${space.cl}`}
            >
              <Image
                src={space.src}
                alt={space.alt}
                fill
                sizes="(max-width: 640px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
