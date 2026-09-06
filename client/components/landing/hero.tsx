"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyFilterPanel } from "./property-filter-panel";

const heroFields = [
  { label: "Area", fromPlaceholder: "Any", toPlaceholder: "Any", unit: "m²" },
  { label: "Bedrooms", fromPlaceholder: "Any", toPlaceholder: "Any" },
  { label: "Budget", fromPlaceholder: "From", toPlaceholder: "To", unit: "€" },
];

const HERO_ROTATION_INTERVAL = 6000;

// Full-screen hero backgrounds must be high-resolution sources; the small
// /landing-i*.png thumbnails (416px) look blurry when stretched to fill.
const HERO_IMAGES = [
  {
    src: "/landing-splash.jpg",
    alt: "Featured home with classic architecture",
  },
  { src: "/singlelisting-3.jpg", alt: "Modern home exterior" },
  { src: "/singlelisting-2.jpg", alt: "Bright living room interior" },
  { src: "/placeholder.jpg", alt: "Contemporary apartment building" },
];

export function Hero() {
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSelectedImage(
        (currentImage) => (currentImage + 1) % HERO_IMAGES.length,
      );
    }, HERO_ROTATION_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="relative isolate min-h-[760px] overflow-hidden bg-neutral-950 lg:min-h-[92vh]">
      <div className="absolute inset-0 z-0">
        <Image
          key={selectedImage}
          src={HERO_IMAGES[selectedImage].src}
          alt={HERO_IMAGES[selectedImage].alt}
          fill
          preload={selectedImage === 0}
          quality={90}
          sizes="100vw"
          className="object-cover transition-opacity duration-500"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,15,24,.92)_0%,rgba(9,15,24,.68)_44%,rgba(9,15,24,.22)_100%)]" />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/20" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[760px] max-w-7xl items-center px-4 pb-24 pt-28 sm:px-6 lg:min-h-[92vh] lg:px-8 lg:pb-28">
        <div className="max-w-3xl">
          <p className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            <span className="h-px w-8 bg-primary" />A better way to live
          </p>
          <h1 className="max-w-2xl font-display text-5xl font-medium leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl lg:text-8xl">
            Find a place worth coming home to.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Thoughtfully selected homes, apartments, and spaces for the next
            chapter of your life.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-11 gap-2 px-5 text-sm font-semibold"
              nativeButton={false}
              render={<Link href="#listings" />}
            >
              Explore listings
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="h-11 gap-2 text-white hover:bg-white/10 hover:text-white"
              nativeButton={false}
              render={<Link href="#how-it-works" />}
            >
              See how it works
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>

          <PropertyFilterPanel
            fields={heroFields}
            variant="hero"
            className="mt-10 max-w-4xl"
          />
        </div>

        <div className="absolute bottom-8 right-8 hidden items-end gap-2 lg:flex">
          <span className="mr-2 max-w-16 text-right text-[10px] font-medium uppercase leading-tight tracking-[0.18em] text-white/60">
            Explore the collection
          </span>
          {HERO_IMAGES.slice(1).map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setSelectedImage(index + 1)}
              aria-label={`Show home photo ${index + 1}`}
              aria-pressed={selectedImage === index + 1}
              className="relative h-16 w-16 overflow-hidden rounded-lg ring-1 ring-white/30 transition-transform hover:-translate-y-1 aria-pressed:ring-2 aria-pressed:ring-primary"
            >
              <Image
                src={image.src}
                alt=""
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>

        <div className="absolute bottom-8 left-4 hidden items-center gap-2 text-xs text-white/60 sm:flex lg:left-8">
          <Search className="h-3.5 w-3.5" />
          <span>1,240 homes currently available</span>
        </div>
      </div>
    </section>
  );
}
