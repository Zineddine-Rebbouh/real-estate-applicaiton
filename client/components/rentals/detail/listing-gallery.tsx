"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  HeartIcon,
  Share2Icon,
  ImageIcon,
  CheckIcon,
} from "lucide-react";
import { toast } from "sonner";
import { ListingLightbox } from "./listing-lightbox";

interface ListingGalleryProps {
  images: { url: string; caption: string; tag?: string }[];
  title: string;
  isFavorite?: boolean;
}

export function ListingGallery({
  images,
  title,
  isFavorite: initialFavorite = false,
}: ListingGalleryProps) {
  const [favorite, setFavorite] = useState(initialFavorite);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Mobile touch swipe handling
  const touchStartX = useRef<number | null>(null);

  const heroImage = images[heroIndex] || images[0];
  const supportingThumbnails = images.slice(1, 5);

  const handleHeroPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeroIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleHeroNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeroIndex((prev) => (prev + 1) % images.length);
  };

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite((prev) => {
      const next = !prev;
      if (next) {
        toast.success("Saved to favorites", {
          description: `${title} has been added to your saved rentals.`,
        });
      } else {
        toast.info("Removed from favorites");
      }
      return next;
    });
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        toast.success("Link copied to clipboard", {
          description: "Listing URL has been copied to your clipboard.",
        });
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      toast.info("Sharing listing", {
        description: "You can copy the URL directly from your browser bar.",
      });
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left -> next
        setHeroIndex((prev) => (prev + 1) % images.length);
      } else {
        // swipe right -> prev
        setHeroIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
  };

  return (
    <>
      <div className="relative w-full select-none">
        {/* Floating Actions (Save & Share) */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share this listing"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur-md transition-all hover:bg-background hover:scale-105 active:scale-95 border border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {copied ? (
              <CheckIcon className="size-4.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Share2Icon className="size-4.5 text-foreground" />
            )}
          </button>

          <button
            type="button"
            onClick={toggleFavorite}
            aria-label={favorite ? "Remove from favorites" : "Save to favorites"}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-background/90 text-foreground shadow-md backdrop-blur-md transition-all hover:bg-background hover:scale-105 active:scale-95 border border-border/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <HeartIcon
              className={`size-4.5 transition-colors ${
                favorite
                  ? "fill-rose-500 text-rose-500"
                  : "text-foreground hover:text-rose-500"
              }`}
            />
          </button>
        </div>

        {/* DESKTOP / TABLET: 60% Hero + 40% 2x2 Grid */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-3 h-[420px] lg:h-[480px]">
          {/* Hero Image (60% width = 7 of 12 cols on sm, 7 of 12 on lg) */}
          <div
            onClick={() => handleOpenLightbox(heroIndex)}
            className="group relative col-span-7 h-full overflow-hidden rounded-xl bg-muted cursor-pointer"
          >
            <Image
              src={heroImage.url}
              alt={heroImage.caption || `${title} hero`}
              fill
              priority
              sizes="(max-width: 1024px) 60vw, 720px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 group-hover:opacity-60 transition-opacity" />

            {/* Prev / Next Hero Navigation */}
            <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
              <button
                type="button"
                onClick={handleHeroPrev}
                aria-label="Previous photo"
                className="pointer-events-auto flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:scale-105 focus-visible:opacity-100"
              >
                <ChevronLeftIcon className="size-5" />
              </button>
              <button
                type="button"
                onClick={handleHeroNext}
                aria-label="Next photo"
                className="pointer-events-auto flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 hover:bg-black/70 hover:scale-105 focus-visible:opacity-100"
              >
                <ChevronRightIcon className="size-5" />
              </button>
            </div>

            {/* Bottom Caption & Badge */}
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 text-xs font-medium text-white/95">
              <span className="rounded-md bg-black/50 px-2 py-1 backdrop-blur-sm">
                Photo {heroIndex + 1} of {images.length}
              </span>
              {heroImage.tag && (
                <span className="rounded-md bg-white/20 px-2 py-1 backdrop-blur-sm">
                  {heroImage.tag}
                </span>
              )}
            </div>
          </div>

          {/* Supporting 2x2 Grid (40% width = 5 of 12 cols) */}
          <div className="col-span-5 grid grid-cols-2 grid-rows-2 gap-3 h-full">
            {supportingThumbnails.map((thumb, idx) => {
              const actualIndex = idx + 1;
              const isLast = idx === 3;
              const remainingCount = images.length - 5;

              return (
                <div
                  key={idx}
                  onClick={() => handleOpenLightbox(actualIndex)}
                  className="group relative h-full w-full overflow-hidden rounded-xl bg-muted cursor-pointer"
                >
                  <Image
                    src={thumb.url}
                    alt={thumb.caption || `${title} photo ${actualIndex + 1}`}
                    fill
                    sizes="(max-width: 1024px) 25vw, 240px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

                  {/* 4th Thumbnail "View all photos" Overlay Trigger */}
                  {isLast && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/55 text-white backdrop-blur-[2px] transition-colors group-hover:bg-black/45 p-2 text-center">
                      <ImageIcon className="size-6 mb-1 text-white" />
                      <span className="text-xs sm:text-sm font-semibold">
                        View all {images.length} photos
                      </span>
                      {remainingCount > 0 && (
                        <span className="text-[11px] text-white/80">
                          +{remainingCount} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE: Swipeable Single-image Carousel */}
        <div
          className="relative block sm:hidden aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onClick={() => handleOpenLightbox(heroIndex)}
        >
          <Image
            src={heroImage.url}
            alt={heroImage.caption || `${title} photo`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

          {/* Navigation Arrows */}
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between pointer-events-none">
            <button
              type="button"
              onClick={handleHeroPrev}
              aria-label="Previous photo"
              className="pointer-events-auto flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            >
              <ChevronLeftIcon className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleHeroNext}
              aria-label="Next photo"
              className="pointer-events-auto flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            >
              <ChevronRightIcon className="size-5" />
            </button>
          </div>

          {/* Bottom mobile info: Indicator dots & count button */}
          <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between text-xs text-white">
            <div className="flex gap-1.5">
              {images.slice(0, 6).map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === heroIndex ? "w-5 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLightbox(heroIndex);
              }}
              className="flex min-h-[44px] items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm hover:bg-black/80"
            >
              <ImageIcon className="size-3.5" />
              <span>
                {heroIndex + 1}/{images.length} photos
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      <ListingLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={images}
        currentIndex={lightboxIndex}
        onSelectIndex={setLightboxIndex}
        propertyTitle={title}
      />
    </>
  );
}

