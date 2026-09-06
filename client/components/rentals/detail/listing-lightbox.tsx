"use client";

import Image from "next/image";
import { useEffect, useCallback } from "react";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: { url: string; caption: string; tag?: string }[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  propertyTitle: string;
}

export function ListingLightbox({
  isOpen,
  onClose,
  images,
  currentIndex,
  onSelectIndex,
  propertyTitle,
}: LightboxProps) {
  const currentImage = images[currentIndex] || images[0];

  const handleNext = useCallback(() => {
    onSelectIndex((currentIndex + 1) % images.length);
  }, [currentIndex, images.length, onSelectIndex]);

  const handlePrev = useCallback(() => {
    onSelectIndex((currentIndex - 1 + images.length) % images.length);
  }, [currentIndex, images.length, onSelectIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Lock body scroll
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${propertyTitle} photo gallery lightbox`}
      className="fixed inset-0 z-50 flex flex-col justify-between bg-black/95 text-white backdrop-blur-md animate-in fade-in duration-200"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold tracking-wide text-zinc-300">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage?.tag && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-zinc-200">
              {currentImage.tag}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close photo gallery lightbox"
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <XIcon className="size-5" />
        </button>
      </div>

      {/* Main Image Viewport with Nav Arrows */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-2 sm:px-16">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous photo"
          className="absolute left-3 sm:left-6 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/90 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ChevronLeftIcon className="size-6" />
        </button>

        <div className="relative h-full w-full max-w-5xl">
          <Image
            src={currentImage.url}
            alt={currentImage.caption || `${propertyTitle} photo ${currentIndex + 1}`}
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            priority
            className="object-contain select-none"
          />
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next photo"
          className="absolute right-3 sm:right-6 z-10 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition-all hover:bg-black/90 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ChevronRightIcon className="size-6" />
        </button>
      </div>

      {/* Bottom bar with caption & thumbnail carousel */}
      <div className="flex flex-col gap-3 bg-black/60 px-4 py-3 sm:px-6">
        <p className="text-center text-xs sm:text-sm text-zinc-300 line-clamp-1">
          {currentImage.caption}
        </p>

        {/* Thumbnail strip */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 scrollbar-thin">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectIndex(idx)}
              aria-label={`Jump to photo ${idx + 1}`}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 transition-all focus-visible:outline-none ${
                idx === currentIndex
                  ? "border-primary ring-2 ring-primary/40 scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

