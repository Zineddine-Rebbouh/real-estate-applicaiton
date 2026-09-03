import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="bg-background py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/landing-call-to-action.jpg"
              alt=""
              fill
              sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), min(1216px, calc(100vw - 4rem))"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/60 to-black/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 px-6 py-16 lg:px-16 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                Your next chapter
              </p>
              <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-white sm:text-5xl">
                Let&apos;s find the place for it.
              </h2>
              <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-8">
                Join thousands of satisfied clients who found their perfect home
                with us
              </p>
              <Button
                size="lg"
                className="gap-2 text-base font-semibold"
                nativeButton={false}
                render={<Link href="/sign-up" />}
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
