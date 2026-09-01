import Image from "next/image";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing-splash.jpg"
          alt="Hero background"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pb-32">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-white leading-tight">
            Neat architecture design
          </h1>
          <p className="mt-6 text-base sm:text-lg text-white/90 leading-relaxed max-w-2xl">
            Discover your perfect property with our curated selection of premium real estate listings
          </p>
        </div>

        {/* Thumbnail Strip */}
        <div className="absolute bottom-6 right-6 hidden lg:flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-20 h-20 rounded-lg overflow-hidden ring-2 ring-white/20">
              <Image
                src={`/landing-i${i}.png`}
                alt={`Preview ${i}`}
                width={80}
                height={80}
                className="object-cover w-full h-full"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
