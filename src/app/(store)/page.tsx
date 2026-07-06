import { HeroSection } from "@/components/store/homepage/hero-section";
import { FeaturedCollections } from "@/components/store/homepage/featured-collections";
import { NewArrivals } from "@/components/store/homepage/new-arrivals";
import { BrandStory } from "@/components/store/homepage/brand-story";
import { BestSellers } from "@/components/store/homepage/best-sellers";
import { Testimonials } from "@/components/store/homepage/testimonials";
import { NewsletterSection } from "@/components/store/homepage/newsletter-section";
import { JewelryGuides } from "@/components/store/homepage/jewelry-guides";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zohraé — Fine Jewelry for Life's Precious Moments",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturedCollections />
      <NewArrivals />
      <BrandStory />
      <BestSellers />
      <JewelryGuides />
      <Testimonials />
      <NewsletterSection />
    </>
  );
}
