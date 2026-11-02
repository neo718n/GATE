import { Bone } from "@/components/site/skeletons";

// Inside the partner shell: the sidebar stays, only the content shimmers.
export default function Loading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="mb-5 flex flex-col gap-2">
        <Bone className="h-3 w-40 rounded-full" />
        <Bone className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Bone key={i} className="h-36 rounded-[1.75rem]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Bone key={i} className="h-56 rounded-[1.75rem]" />
        ))}
      </div>
    </div>
  );
}
