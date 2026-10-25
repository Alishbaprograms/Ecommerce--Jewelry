import { HeroSection } from "@/components/store/homepage/hero-section";
import { FeaturedCollections } from "@/components/store/homepage/featured-collections";
import { NewArrivals } from "@/components/store/homepage/new-arrivals";
import { BestSellers } from "@/components/store/homepage/best-sellers";
import { WhyParents } from "@/components/store/homepage/why-parents";
import { NewsletterSection } from "@/components/store/homepage/newsletter-section";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zohraé — Tiny Treasures for Little Ones",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCollections />
      <NewArrivals />
      <WhyParents />
      <BestSellers />
      <NewsletterSection />
    </>
  );
}
