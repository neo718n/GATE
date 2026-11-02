import { Bone } from "@/components/site/skeletons";

export default function Loading() {
  return (
    <div className="site flex min-h-screen items-center justify-center bg-ivory px-5">
      <Bone className="h-96 w-full max-w-md rounded-[2rem]" />
    </div>
  );
}
