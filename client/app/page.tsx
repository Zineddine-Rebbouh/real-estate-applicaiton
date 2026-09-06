import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { FeaturedListing } from "@/components/landing/featured-listing";
import { ListingFilmstrip } from "@/components/landing/property-grid";
import { SpacesGallery } from "@/components/landing/gallery";
import { CareSection } from "@/components/landing/feature-row";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CTABanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturedListing />
        {/* <ListingFilmstrip /> */}
        <SpacesGallery />
        <CareSection />
        <HowItWorks />
        <CTABanner />
      </main>
      <Footer />
    </>
  );
}
