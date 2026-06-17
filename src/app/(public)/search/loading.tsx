import SPMLoader from "@/components/shared/SPMLoader";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[60vh] relative">
      {/* Subtle brand glow matching the hero design */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none">
        <div className="h-[200px] w-[200px] rounded-full bg-[#1B5FED]/5 blur-[60px]" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-5">
        <SPMLoader size={125} color="#1B5FED" />
        <p className="text-xs font-mono tracking-[0.2em] text-surface-400 dark:text-surface-500 uppercase select-none animate-pulse">
          Searching Registry
        </p>
      </div>
    </div>
  );
}
