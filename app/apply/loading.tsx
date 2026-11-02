import { Bone } from "@/components/site/skeletons";

// Mirrors the application page: heading, summary rail and the form card.
export default function Loading() {
  return (
    <div className="relative overflow-hidden">
      <div className="gold-aura pointer-events-none absolute inset-x-0 top-0 h-[520px]" />
      <div className="relative mx-auto max-w-7xl px-5 pb-20 pt-12 md:pt-16">
        <div className="mb-10 flex max-w-3xl flex-col gap-3">
          <Bone className="h-4 w-48 rounded-full" />
          <Bone className="h-12 w-[80%] md:h-16" />
          <Bone className="h-4 w-[65%] rounded-full" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr] lg:gap-10">
          <Bone className="h-80 rounded-[2rem]" />
          <div className="flex flex-col gap-6 rounded-[2rem] border border-line bg-white p-6 md:p-10">
            <Bone className="h-1 w-full rounded-full" />
            <Bone className="h-8 w-64" />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {Array.from({ length: 6 }, (_, i) => (
                <Bone key={i} className="h-12" />
              ))}
            </div>
            <Bone className="h-12" />
          </div>
        </div>
      </div>
    </div>
  );
}
