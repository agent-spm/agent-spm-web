import SPMLoader from "@/components/shared/SPMLoader";

export default function GlobalLoading() {
  return (
    <div className="flex min-h-[70vh] w-full flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle brand glow matching the homepage hero design */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="h-[250px] w-[250px] rounded-full bg-[#1B5FED]/5 blur-[80px]" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center">
          <SPMLoader size={130} color="#1B5FED" />
        </div>
        <p className="text-xs font-mono tracking-[0.2em] text-surface-400 dark:text-surface-500 uppercase select-none animate-pulse">
          Loading Registry
        </p>
      </div>
    </div>
  );
}
