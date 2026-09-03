import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeaturedListing } from "@/components/landing/featured-listing";
import { DiscoverSection } from "@/components/landing/discover-section";
import { PropertyGrid } from "@/components/landing/property-grid";
import { Gallery } from "@/components/landing/gallery";
import { FeatureRow } from "@/components/landing/feature-row";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CTABanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <DiscoverSection />
        <FeaturedListing />
        <PropertyGrid />
        <Gallery />
        <FeatureRow />
        <HowItWorks />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
