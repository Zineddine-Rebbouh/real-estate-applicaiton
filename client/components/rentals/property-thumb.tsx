import Image from "next/image";
import { cn } from "@/lib/utils";

interface PropertyThumbProps {
  src?: string | null;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

// Listing thumbnail with a placeholder fallback. Sources under /uploads/
// are served by the API through a rewrite, which the image optimizer
// cannot resolve — those render unoptimized.
export function PropertyThumb({ src, alt, className, fill, sizes }: PropertyThumbProps) {
  const url = src && src.trim() ? src : "/singlelisting-2.jpg";
  const unoptimized = url.startsWith("/uploads/");
  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes ?? "100vw"}
        unoptimized={unoptimized}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <Image
      src={url}
      alt={alt}
      width={128}
      height={128}
      unoptimized={unoptimized}
      className={cn("object-cover", className)}
    />
  );
}
