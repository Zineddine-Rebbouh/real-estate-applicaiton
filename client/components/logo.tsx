import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  light = false,
}: {
  className?: string;
  light?: boolean;
}) {
  return (
    <Image
      src="/new-logo-habitat.png"
      alt="Habitat"
      width={320}
      height={110}
      className={cn("h-8 w-auto", light && "brightness-0 invert", className)}
    />
  );
}
