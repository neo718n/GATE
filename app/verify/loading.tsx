import { Bone } from "@/components/site/skeletons";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12 sm:px-6 sm:py-20">
      <div className="flex flex-col items-center gap-3">
        <Bone className="h-6 w-44 rounded-full" />
        <Bone className="h-10 w-80" />
        <Bone className="h-4 w-72 rounded-full" />
      </div>
      <Bone className="h-48 rounded-2xl" />
    </div>
  );
}
