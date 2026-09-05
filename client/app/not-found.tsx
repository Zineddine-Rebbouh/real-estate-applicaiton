import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, HouseIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-24 sm:px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_68%)]" />

      <div className="relative flex w-full max-w-lg flex-col items-center text-center">
        {/* <Link
          href="/"
          className="mb-12 flex items-center gap-2"
          aria-label="Habitat home"
        >
          <Image src="/logo.svg" alt="Habitat" width={32} height={32} />
          <span className="font-display text-lg font-semibold text-foreground">
            Habitat
          </span>
        </Link> */}

        <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
          <HouseIcon className="size-7 text-primary" aria-hidden="true" />
        </div>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          This place is off the map.
        </h1>
        <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          We couldn&apos;t find the page you were looking for. It may have
          moved, or the address may be missing a detail.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button nativeButton={false} render={<Link href="/" />}>
            <SearchIcon />
            Browse Properties
          </Button>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/" />}
          >
            <ArrowLeftIcon />
            Return Home
          </Button>
        </div>
      </div>
    </main>
  );
}
