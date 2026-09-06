import React, { useState } from 'react';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
}

export function ImageCarousel({ images, alt = '' }: ImageCarouselProps) {
  const [current, setCurrent] = useState(0);
  const total = images.length;

  const goTo = (index: number) => {
    setCurrent((index + total) % total);
  };

  return (
    <div className="relative">
      {/* Images */}
      <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide" style={{ scrollSnapType: 'x mandatory' }}>
        {images.map((src, idx) => (
          <div
            key={src}
            className={`flex-shrink-0 w-full snap-center ${idx === current ? '' : ''}`}
          >
            <Image src={src} alt={alt} fill quality={90} className="object-cover" />
          </div>
        ))}
      </div>
      {/* Pagination dots */}
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            type="button"
            className={`h-2 w-2 rounded-full transition-colors ${idx === current ? 'bg-primary' : 'bg-muted'}`}
            onClick={() => goTo(idx)}
          />
        ))}
      </div>
    </div>
  );
}

