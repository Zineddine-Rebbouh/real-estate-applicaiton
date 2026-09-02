import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTABanner() {
  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/landing-call-to-action.jpg"
              alt=""
              fill
              sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), min(1216px, calc(100vw - 4rem))"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          </div>

          {/* Content */}
          <div className="relative z-10 py-16 lg:py-24 px-6 lg:px-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-4">
                Ready to find your dream property?
              </h2>
              <p className="text-base sm:text-lg text-white/90 leading-relaxed mb-8">
                Join thousands of satisfied clients who found their perfect home
                with us
              </p>
              <Button size="lg" className="gap-2">
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
