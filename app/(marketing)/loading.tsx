import { HeroSkeleton } from "@/components/site/skeletons";

// Shown while a page streams in; the header and footer stay in place.
export default function Loading() {
  return <HeroSkeleton />;
}
